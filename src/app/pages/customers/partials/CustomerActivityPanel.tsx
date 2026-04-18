import { FC, useCallback, useEffect, useState } from 'react';
import { ShoppingCart, Wrench, Users, Award } from 'lucide-react';
import { ScrollArea, Text, Flex } from '@radix-ui/themes';
import * as Tabs from '@radix-ui/react-tabs';
import CustomerHeader from './CustomerHeader';
import { SalesActivityList, ServiceOrdersActivityList } from './ActivityLists';
import CustomerLoyaltyTab from './CustomerLoyaltyTab';
import saleService from '../../../services/sale.service';
import serviceOrderService from '../../../services/service-order.service';

const PER_PAGE = 15;

interface PaginationMeta {
    page: number;
    totalItems: number;
    totalPages: number;
}

const defaultMeta: PaginationMeta = { page: 1, totalItems: 0, totalPages: 1 };

interface CustomerActivityPanelProps {
    customer: Customer | null;
    onEdit: (customer: Customer) => void;
    onDelete: (customerId: string, customerName: string) => void;
}

const CustomerActivityPanel: FC<CustomerActivityPanelProps> = ({ customer, onEdit, onDelete }) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [serviceOrders, setServiceOrders] = useState<ServiceOrderWithItems[]>([]);
    const [isLoadingSales, setIsLoadingSales] = useState(false);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [salesMeta, setSalesMeta] = useState<PaginationMeta>(defaultMeta);
    const [ordersMeta, setOrdersMeta] = useState<PaginationMeta>(defaultMeta);

    const loadSales = useCallback(async (customerId: string, page: number) => {
        setIsLoadingSales(true);
        try {
            const result = await saleService.listSales({ customerId, page, limit: PER_PAGE } as SaleListQuery);
            setSales(result?.sales || []);
            const p = result?.pagination;
            setSalesMeta({
                page: p?.currentPage ?? page,
                totalItems: p?.totalItems ?? 0,
                totalPages: p?.totalPages ?? 1,
            });
        } catch {
            setSales([]);
            setSalesMeta({ ...defaultMeta, page });
        } finally {
            setIsLoadingSales(false);
        }
    }, []);

    const loadOrders = useCallback(async (customerId: string, page: number) => {
        setIsLoadingOrders(true);
        try {
            const result = await serviceOrderService.list({ customerId, page, limit: PER_PAGE });
            setServiceOrders(result?.orders || []);
            const p = result?.pagination;
            setOrdersMeta({
                page: p?.currentPage ?? page,
                totalItems: p?.totalItems ?? 0,
                totalPages: p?.totalPages ?? 1,
            });
        } catch {
            setServiceOrders([]);
            setOrdersMeta({ ...defaultMeta, page });
        } finally {
            setIsLoadingOrders(false);
        }
    }, []);

    // Reset and load page 1 when customer changes
    useEffect(() => {
        if (!customer) {
            setSales([]); setServiceOrders([]);
            setSalesMeta(defaultMeta); setOrdersMeta(defaultMeta);
            return;
        }
        loadSales(customer.customerId, 1);
        loadOrders(customer.customerId, 1);
    }, [customer, loadSales, loadOrders]);

    const handleSalesPage = useCallback((page: number) => {
        if (customer) loadSales(customer.customerId, page);
    }, [customer, loadSales]);

    const handleOrdersPage = useCallback((page: number) => {
        if (customer) loadOrders(customer.customerId, page);
    }, [customer, loadOrders]);

    if (!customer) {
        return (
            <Flex direction="column" align="center" justify="center" height="100%" px="6">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                </div>
                <Text size="3" weight="bold" color="gray">Select a customer</Text>
                <Text size="2" color="gray" align="center" className="mt-1 max-w-xs">
                    Choose a customer from the list to view their activity and transaction history.
                </Text>
            </Flex>
        );
    }

    const tabTriggerClass =
        'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors border-b-2 outline-none cursor-pointer ' +
        'text-gray-500 dark:text-gray-400 border-transparent ' +
        'hover:text-gray-700 dark:hover:text-gray-300 ' +
        'data-[state=active]:text-sky-500 dark:data-[state=active]:text-sky-400 ' +
        'data-[state=active]:border-sky-500 dark:data-[state=active]:border-sky-400';

    return (
        <div className="flex flex-col h-full">
            <CustomerHeader
                customer={customer}
                salesCount={salesMeta.totalItems}
                serviceOrdersCount={ordersMeta.totalItems}
                onEdit={onEdit}
                onDelete={onDelete}
            />

            <Tabs.Root defaultValue="sales" className="flex flex-col flex-1 min-h-0">
                <Tabs.List className="flex-shrink-0 flex border-b border-gray-200 dark:border-gray-700">
                    <Tabs.Trigger value="sales" className={tabTriggerClass}>
                        <ShoppingCart className="w-4 h-4" /> Sales
                    </Tabs.Trigger>
                    <Tabs.Trigger value="service-orders" className={tabTriggerClass}>
                        <Wrench className="w-4 h-4" /> Service Orders
                    </Tabs.Trigger>
                    <Tabs.Trigger value="loyalty" className={tabTriggerClass}>
                        <Award className="w-4 h-4" /> Loyalty
                    </Tabs.Trigger>
                </Tabs.List>

                <ScrollArea scrollbars="vertical" className="flex-1 min-h-0">
                    <Tabs.Content value="sales">
                        <SalesActivityList
                            sales={sales}
                            isLoading={isLoadingSales}
                            page={salesMeta.page}
                            totalPages={salesMeta.totalPages}
                            totalItems={salesMeta.totalItems}
                            onPageChange={handleSalesPage}
                        />
                    </Tabs.Content>
                    <Tabs.Content value="service-orders">
                        <ServiceOrdersActivityList
                            orders={serviceOrders}
                            isLoading={isLoadingOrders}
                            page={ordersMeta.page}
                            totalPages={ordersMeta.totalPages}
                            totalItems={ordersMeta.totalItems}
                            onPageChange={handleOrdersPage}
                        />
                    </Tabs.Content>
                    <Tabs.Content value="loyalty">
                        <CustomerLoyaltyTab
                            customerId={customer.customerId}
                            isDefault={customer.isDefault}
                        />
                    </Tabs.Content>
                </ScrollArea>
            </Tabs.Root>
        </div>
    );
};

export default CustomerActivityPanel;
