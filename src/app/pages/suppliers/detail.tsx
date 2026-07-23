import { FC, useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Truck, Package, ShoppingCart, Mail, Phone, MapPin, CreditCard, User } from 'lucide-react';
import { Box, Flex, Grid, Text, Badge } from '@radix-ui/themes';
import * as Tabs from '@radix-ui/react-tabs';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { FormFieldCard, ComponentLoader } from '../../components';
import { useSuppliers } from '../../hooks/useSuppliers';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { supplierService } from '../../services';
import { ROUTES } from '../../utils/constants';
import { formatCurrencyShort } from '../../utils';
import SupplierBalanceWidget from './partials/SupplierBalanceWidget';
import SupplierProductsTab from './partials/SupplierProductsTab';
import SupplierPurchaseOrdersTab from './partials/SupplierPurchaseOrdersTab';
import ReceiveModal from '../purchase-orders/partials/ReceiveModal';

const statusColorMap: Record<SupplierStatus, 'green' | 'gray' | 'red'> = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    SUSPENDED: 'red',
};

const tabTriggerClass =
    'flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-medium transition-colors border-b-2 outline-none cursor-pointer ' +
    'text-gray-500 dark:text-gray-400 border-transparent ' +
    'hover:text-gray-700 dark:hover:text-gray-300 ' +
    'data-[state=active]:text-sky-500 dark:data-[state=active]:text-sky-400 ' +
    'data-[state=active]:border-sky-500 dark:data-[state=active]:border-sky-400';

const SupplierDetail: FC = () => {
    const { supplierId } = useParams<{ supplierId: string }>();
    const navigate = useNavigate();
    const { getById } = useSuppliers();

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [products, setProducts] = useState<SupplierProductHistoryItem[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const {
        purchaseOrders,
        isLoading: isLoadingOrders,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        supplierFilter,
        setSupplierFilter,
        sendPurchaseOrder,
        receivePurchaseOrder,
        cancelPurchaseOrder,
    } = usePurchaseOrders();

    // usePurchaseOrders fetches unfiltered data on its own mount, before the effect below
    // has a chance to set the supplier filter — gate the table on the filter actually
    // matching this supplier so we never render another supplier's purchase orders.
    const ordersMatchSupplier = !!supplierId && supplierFilter === supplierId;

    const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);

    useEffect(() => {
        if (!supplierId) return;

        setSupplierFilter(supplierId);

        (async () => {
            setIsLoading(true);
            const data = await getById(supplierId);
            setSupplier(data);
            setIsLoading(false);
        })();
    }, [supplierId]);

    useEffect(() => {
        if (!supplierId) return;

        (async () => {
            setIsLoadingProducts(true);
            try {
                const data = await supplierService.getSupplierProductHistory(supplierId);
                setProducts(data || []);
            } catch (error) {
                console.error('Failed to load supplier product history:', error);
                setProducts([]);
            } finally {
                setIsLoadingProducts(false);
            }
        })();
    }, [supplierId]);

    const handlePageChange = useCallback((newPage: number) => setPage(newPage), [setPage]);
    const handlePerRowsChange = useCallback((newPerPage: number, newPage: number) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }, [setPerPage, setPage]);

    const handleSend = useCallback((po: PurchaseOrder) => {
        Confirm.show('Send Purchase Order', `Send ${po.poNumber} to ${supplier?.name || 'supplier'}?`, 'Yes, Send', 'Cancel', async () => {
            try {
                await sendPurchaseOrder(po.id);
            } catch {
                Notify.failure('Failed to send purchase order');
            }
        });
    }, [sendPurchaseOrder, supplier?.name]);

    const handleReceive = useCallback((po: PurchaseOrder) => setReceivingPO(po), []);

    const handleCancel = useCallback((po: PurchaseOrder) => {
        Confirm.show('Cancel Purchase Order', `Are you sure you want to cancel ${po.poNumber}?`, 'Yes, Cancel', 'No', async () => {
            try {
                await cancelPurchaseOrder(po.id);
            } catch {
                Notify.failure('Failed to cancel purchase order');
            }
        }, undefined, { okButtonBackground: '#ef4444', titleColor: '#ef4444' });
    }, [cancelPurchaseOrder]);

    const handleViewOrder = useCallback((po: PurchaseOrder) => {
        navigate(ROUTES.PURCHASE_ORDER_FORM, { state: { purchaseOrderId: po.id } });
    }, [navigate]);

    if (isLoading) {
        return (
            <AppLayout>
                <ComponentLoader loading />
            </AppLayout>
        );
    }

    if (!supplier) {
        return (
            <AppLayout>
                <Flex direction="column" align="center" justify="center">
                    <Text color="gray">Supplier not found.</Text>
                </Flex>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <PageHeader
                title={supplier.name}
                description={supplier.code ? `Supplier · ${supplier.code}` : 'Supplier details'}
                icon={<Truck className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                showBackButton
                onBack={() => navigate(-1)}
            />

            <Flex direction="column" gap="5">
                <SupplierBalanceWidget supplierId={supplier.id} supplierName={supplier.name} />

                <FormFieldCard
                    title="Supplier Information"
                    headerAction={
                        <Badge variant="soft" radius="full" color={statusColorMap[supplier.status] || 'gray'}>
                            {supplier.status}
                        </Badge>
                    }
                >
                    <Grid columns={{ initial: '1', sm: '2', md: '4' }} gap="4">
                        <Box>
                            <Flex align="center" gap="1">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <Text size="1" color="gray">Contact Person</Text>
                            </Flex>
                            <Text as="p" size="2" weight="medium" mt="1">{supplier.contactPerson || '—'}</Text>
                        </Box>
                        <Box>
                            <Flex align="center" gap="1">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <Text size="1" color="gray">Phone</Text>
                            </Flex>
                            <Text as="p" size="2" weight="medium" mt="1">{supplier.phone || '—'}</Text>
                        </Box>
                        <Box>
                            <Flex align="center" gap="1">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                <Text size="1" color="gray">Email</Text>
                            </Flex>
                            <Text as="p" size="2" weight="medium" mt="1">{supplier.email || '—'}</Text>
                        </Box>
                        <Box>
                            <Flex align="center" gap="1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <Text size="1" color="gray">Address</Text>
                            </Flex>
                            <Text as="p" size="2" weight="medium" mt="1">{supplier.address || '—'}</Text>
                        </Box>
                        <Box>
                            <Text size="1" color="gray">Tax ID / VAT</Text>
                            <Text as="p" size="2" weight="medium" mt="1">{supplier.taxId || '—'}</Text>
                        </Box>
                        <Box>
                            <Flex align="center" gap="1">
                                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                <Text size="1" color="gray">Payment Terms</Text>
                            </Flex>
                            <Text as="p" size="2" weight="medium" mt="1">{(supplier.paymentTerms || '—').replace('_', ' ')}</Text>
                        </Box>
                        <Box>
                            <Text size="1" color="gray">Credit Limit</Text>
                            <Text as="p" size="2" weight="medium" mt="1">{formatCurrencyShort(supplier.creditLimit || 0)}</Text>
                        </Box>
                    </Grid>
                </FormFieldCard>

                <Box className="rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Tabs.Root defaultValue="products">
                        <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                            <Tabs.Trigger value="products" className={tabTriggerClass}>
                                <Package className="w-4 h-4" /> Products Supplied
                            </Tabs.Trigger>
                            <Tabs.Trigger value="orders" className={tabTriggerClass}>
                                <ShoppingCart className="w-4 h-4" /> Purchase Orders
                            </Tabs.Trigger>
                        </Tabs.List>

                        <Tabs.Content value="products">
                            <SupplierProductsTab products={products} isLoading={isLoadingProducts} />
                        </Tabs.Content>

                        <Tabs.Content value="orders">
                            <SupplierPurchaseOrdersTab
                                purchaseOrders={ordersMatchSupplier ? purchaseOrders : []}
                                isLoading={isLoadingOrders || !ordersMatchSupplier}
                                perPage={perPage}
                                totalRows={ordersMatchSupplier ? totalRows : 0}
                                onPageChange={handlePageChange}
                                onPerRowsChange={handlePerRowsChange}
                                onSend={handleSend}
                                onReceive={handleReceive}
                                onCancel={handleCancel}
                                onView={handleViewOrder}
                            />
                        </Tabs.Content>
                    </Tabs.Root>
                </Box>
            </Flex>

            {receivingPO && (
                <ReceiveModal
                    purchaseOrder={receivingPO}
                    onClose={() => setReceivingPO(null)}
                    onReceive={receivePurchaseOrder}
                />
            )}
        </AppLayout>
    );
};

export default SupplierDetail;
