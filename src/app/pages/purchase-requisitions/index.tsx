import {
    FunctionComponent,
    useCallback,
    useContext,
    useState,
    useMemo,
} from 'react';
import { useNavigate } from 'react-router';
import {
    ClipboardList,
    Plus,
    FilterX,
    Clock,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import { Box, Flex, Text, Select, Button, IconButton } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePagination from '../../components/MobilePagination';
import { getTableStyles } from '../../utils/table-styles';
import {
    ZonseThemeContext,
    ComponentLoader,
    ProcurementSummaryCards,
} from '../../components';
import type { ProcurementSummaryCard } from '../../components';
import { usePurchaseRequisitions } from '../../hooks/usePurchaseRequisitions';
import { getRequisitionTableColumns } from './partials/RequisitionTableColumns';
import { RequisitionMobileList } from './partials/RequisitionMobileCard';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import ApproveModal from './partials/ApproveModal';
import RejectModal from './partials/RejectModal';
import RequisitionFormModal from './partials/RequisitionFormModal';
import { Confirm } from 'notiflix';

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PARTIALLY_APPROVED', label: 'Partially Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const PurchaseRequisitionManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [approvingReq, setApprovingReq] =
        useState<PurchaseRequisitionWithItems | null>(null);
    const [rejectingReq, setRejectingReq] =
        useState<PurchaseRequisitionWithItems | null>(null);
    const [formState, setFormState] = useState<{
        requisitionId?: string;
        editMode?: boolean;
    } | null>(null);

    const {
        requisitions,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        loadRequisitions,
        approveRequisition,
        rejectRequisition,
        cancelRequisition,
    } = usePurchaseRequisitions();

    const hasActiveFilters = useMemo(() => {
        return !!statusFilter;
    }, [statusFilter]);

    const summaryCards: ProcurementSummaryCard[] = useMemo(() => {
        const pendingCount = requisitions.filter(
            (r) => r.status === 'PENDING',
        ).length;
        const approvedCount = requisitions.filter(
            (r) => r.status === 'APPROVED',
        ).length;
        const partialApprovedCount = requisitions.filter(
            (r) => r.status === 'PARTIALLY_APPROVED',
        ).length;
        const rejectedCount = requisitions.filter(
            (r) => r.status === 'REJECTED',
        ).length;

        return [
            {
                title: 'Total Requisitions',
                value: totalRows,
                icon: ClipboardList,
                bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
                iconBgColor: 'bg-cyan-100 dark:bg-cyan-900/40',
                textColor: 'text-cyan-500 dark:text-cyan-400',
            },
            {
                title: 'Pending',
                value: pendingCount,
                icon: Clock,
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
            {
                title: 'Approved',
                value: approvedCount,
                icon: CheckCircle,
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Partially Approved',
                value: partialApprovedCount,
                icon: CheckCircle,
                bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
                iconBgColor: 'bg-cyan-100 dark:bg-cyan-900/40',
                textColor: 'text-cyan-500 dark:text-cyan-400',
            },
            {
                title: 'Rejected',
                value: rejectedCount,
                icon: XCircle,
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-500 dark:text-red-400',
            },
        ];
    }, [requisitions, totalRows]);

    const handleAddRequisition = useCallback(() => setFormState({}), []);

    const handleApprove = useCallback((req: PurchaseRequisitionWithItems) => {
        setApprovingReq(req);
    }, []);

    const handleReject = useCallback((req: PurchaseRequisitionWithItems) => {
        setRejectingReq(req);
    }, []);

    const handleCancel = useCallback(
        async (req: PurchaseRequisitionWithItems) => {
            Confirm.show(
                'Cancel Requisition',
                `Are you sure you want to cancel ${req.requisitionNumber}?`,
                'Yes, Cancel',
                'No',
                async () => {
                    await cancelRequisition(req.id);
                },
            );
        },
        [cancelRequisition],
    );

    const handleView = useCallback((req: PurchaseRequisitionWithItems) => {
        setFormState({ requisitionId: req.id });
    }, []);

    const handleCreatePO = useCallback(
        (req: PurchaseRequisitionWithItems) => {
            navigate(ROUTES.PURCHASE_ORDER_FORM, {
                state: { requisitionId: req.id },
            });
        },
        [navigate],
    );

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
    }, [setStatusFilter]);

    const handlePageChange = useCallback(
        (page: number) => {
            setPage(page);
        },
        [setPage],
    );

    const handlePerRowsChange = useCallback(
        (newPerPage: number, page: number) => {
            setPerPage(newPerPage);
            setPage(page);
        },
        [setPerPage, setPage],
    );

    const columns = getRequisitionTableColumns({
        onApprove: handleApprove,
        onReject: handleReject,
        onCancel: handleCancel,
        onView: handleView,
        onCreatePO: handleCreatePO,
    });

    return (
        <AppLayout>
            <Box className="max-w-full">
                <PageHeader
                    icon={
                        <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-500 dark:text-cyan-400" />
                    }
                    title="Purchase Requisitions"
                    description="Request and manage stock requisitions before raising purchase orders"
                    action={
                        <Flex
                            direction={{ initial: 'column', sm: 'row' }}
                            gap={{ initial: '2', sm: '3' }}
                            align="center"
                        >
                            <Select.Root
                                value={statusFilter || 'all'}
                                onValueChange={(val) =>
                                    setStatusFilter(
                                        val === 'all'
                                            ? ''
                                            : (val as RequisitionStatusType),
                                    )
                                }
                            >
                                <Select.Trigger
                                    variant="surface"
                                    placeholder="All Status"
                                    className="w-full sm:w-48"
                                />
                                <Select.Content position="popper">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <Select.Item
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>

                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    color="red"
                                    size="2"
                                    onClick={handleClearFilters}
                                >
                                    <FilterX className="w-4 h-4" />
                                    Clear
                                </Button>
                            )}

                            {isMobile ? (
                                <IconButton
                                    variant="outline"
                                    color="cyan"
                                    size="2"
                                    onClick={handleAddRequisition}
                                    aria-label="New Requisition"
                                >
                                    <Plus className="w-4 h-4" />
                                </IconButton>
                            ) : (
                                <Button size="2" onClick={handleAddRequisition}>
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden md:inline">
                                        New Requisition
                                    </span>
                                </Button>
                            )}
                        </Flex>
                    }
                />

                <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Box px="4">
                        <ProcurementSummaryCards
                            cards={summaryCards}
                            isLoading={isLoading}
                        />
                    </Box>

                    {isMobile ? (
                        <Box className="overflow-hidden">
                            {isLoading ? (
                                <RequisitionMobileList
                                    requisitions={[]}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onCancel={handleCancel}
                                    onView={handleView}
                                    onCreatePO={handleCreatePO}
                                    isLoading={true}
                                />
                            ) : requisitions.length === 0 ? (
                                <Flex
                                    direction="column"
                                    align="center"
                                    justify="center"
                                    py="9"
                                    px="4"
                                >
                                    <Flex
                                        align="center"
                                        justify="center"
                                        className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"
                                    >
                                        <ClipboardList className="w-8 h-8 text-gray-400" />
                                    </Flex>
                                    <Text
                                        as="p"
                                        size="4"
                                        weight="medium"
                                        align="center"
                                        className="text-gray-900 dark:text-white mb-2"
                                    >
                                        {hasActiveFilters
                                            ? 'No matching requisitions'
                                            : 'No requisitions yet'}
                                    </Text>
                                    <Text
                                        as="p"
                                        size="2"
                                        color="gray"
                                        align="center"
                                        className="max-w-sm"
                                    >
                                        {hasActiveFilters
                                            ? 'Try adjusting your filters to see requisitions.'
                                            : 'Get started by creating your first purchase requisition.'}
                                    </Text>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            color="cyan"
                                            size="2"
                                            mt="4"
                                            onClick={handleClearFilters}
                                        >
                                            Clear filters
                                        </Button>
                                    )}
                                </Flex>
                            ) : (
                                <>
                                    <RequisitionMobileList
                                        requisitions={requisitions}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                        onCancel={handleCancel}
                                        onView={handleView}
                                        onCreatePO={handleCreatePO}
                                        isLoading={false}
                                    />
                                    <MobilePagination
                                        page={page}
                                        totalRows={totalRows}
                                        perPage={perPage}
                                        onPageChange={setPage}
                                    />
                                </>
                            )}
                        </Box>
                    ) : (
                        <Box className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={requisitions}
                                theme={mode as Themes}
                                progressPending={isLoading}
                                progressComponent={
                                    <ComponentLoader loading={isLoading} />
                                }
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[
                                    10, 15, 25, 50, 100,
                                ]}
                                onChangeRowsPerPage={handlePerRowsChange}
                                onChangePage={handlePageChange}
                                customStyles={getTableStyles(mode)}
                                highlightOnHover
                                striped
                                responsive
                                persistTableHead
                                noDataComponent={
                                    <Flex
                                        direction="column"
                                        align="center"
                                        justify="center"
                                        py="9"
                                        className="dark:bg-gray-800 flex-1"
                                    >
                                        <Flex
                                            align="center"
                                            justify="center"
                                            className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700"
                                        >
                                            <ClipboardList className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </Flex>
                                        <Text
                                            as="p"
                                            size="4"
                                            weight="bold"
                                            className="mt-4 text-gray-900 dark:text-gray-100"
                                        >
                                            {hasActiveFilters
                                                ? 'No matching requisitions'
                                                : 'No requisitions yet'}
                                        </Text>
                                        <Text
                                            as="p"
                                            size="2"
                                            color="gray"
                                            align="center"
                                            className="mt-2 max-w-sm"
                                        >
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters to see requisitions.'
                                                : 'Get started by creating your first purchase requisition.'}
                                        </Text>
                                    </Flex>
                                }
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            {approvingReq && (
                <ApproveModal
                    requisition={approvingReq}
                    onClose={() => setApprovingReq(null)}
                    onApprove={approveRequisition}
                />
            )}

            {rejectingReq && (
                <RejectModal
                    requisition={rejectingReq}
                    onClose={() => setRejectingReq(null)}
                    onReject={rejectRequisition}
                />
            )}

            {formState && (
                <RequisitionFormModal
                    requisitionId={formState.requisitionId}
                    editMode={formState.editMode}
                    onClose={() => setFormState(null)}
                    onSaved={loadRequisitions}
                />
            )}
        </AppLayout>
    );
};

export default PurchaseRequisitionManagement;
