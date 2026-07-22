import { FC } from 'react';
import { ShoppingCart } from 'lucide-react';
import DataTable from 'react-data-table-component';
import TableSkeleton from '../../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../../components/TableEmptyState';
import { getPurchaseOrderTableColumns } from '../../purchase-orders/partials/PurchaseOrderTableColumns';

interface SupplierPurchaseOrdersTabProps {
    purchaseOrders: PurchaseOrder[];
    isLoading: boolean;
    perPage: number;
    totalRows: number;
    onPageChange: (page: number) => void;
    onPerRowsChange: (newPerPage: number, page: number) => void;
    onSend: (po: PurchaseOrder) => void;
    onReceive: (po: PurchaseOrder) => void;
    onCancel: (po: PurchaseOrder) => void;
    onView: (po: PurchaseOrder) => void;
}

const SupplierPurchaseOrdersTab: FC<SupplierPurchaseOrdersTabProps> = ({
    purchaseOrders,
    isLoading,
    perPage,
    totalRows,
    onPageChange,
    onPerRowsChange,
    onSend,
    onReceive,
    onCancel,
    onView,
}) => {
    const columns = getPurchaseOrderTableColumns({ onSend, onReceive, onCancel, onView });

    return (
        <DataTable
            columns={columns}
            data={purchaseOrders}
            progressPending={isLoading}
            progressComponent={<TableSkeleton rows={5} columns={5} showCheckbox={false} showActions />}
            highlightOnHover
            responsive
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[10, 15, 25, 50]}
            onChangeRowsPerPage={onPerRowsChange}
            onChangePage={onPageChange}
            noDataComponent={
                <TableEmptyState
                    icon={<ShoppingCart />}
                    title="No purchase orders yet"
                    description="Purchase orders placed with this supplier will show up here."
                />
            }
        />
    );
};

export default SupplierPurchaseOrdersTab;
