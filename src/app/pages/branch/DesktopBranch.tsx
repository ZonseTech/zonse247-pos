import { FunctionComponent, useContext } from 'react';
import { Store } from 'lucide-react';
import DataTable from 'react-data-table-component';
import { ZonseThemeContext, ComponentLoader } from '../../components';
import { getTableStyles } from '../../utils/table-styles';
import { getBranchColumns } from './partials/BranchTableColumns';
import { BranchPermissions } from '../../hooks/useBranchPermissions';

interface DesktopBranchProps {
    isLoading: boolean;
    branches: Branch[];
    totalRows: number;
    page: number;
    perPage: number;
    searchTerm: string;
    onEdit: (branch: Branch) => void;
    onStatusToggle: (branchId: string, currentStatus: string) => void;
    onDelete: (branchId: string, branchName: string) => void;
    onPageChange: (newPage: number) => void;
    onPerPageChange: (newPerPage: number, newPage: number) => void;
    permissions: BranchPermissions;
}

const DesktopBranch: FunctionComponent<DesktopBranchProps> = ({
    isLoading,
    branches,
    totalRows,
    page,
    perPage,
    searchTerm,
    onEdit,
    onStatusToggle,
    onDelete,
    onPageChange,
    onPerPageChange,
    permissions,
}) => {
    const { mode } = useContext(ZonseThemeContext);
    const columns = getBranchColumns(onEdit, onStatusToggle, onDelete, permissions);

    return (
        <div className="overflow-hidden">
            <DataTable
                columns={columns}
                data={branches}
                theme={mode as string}
                progressPending={isLoading}
                progressComponent={<ComponentLoader loading={isLoading} />}
                highlightOnHover
                striped
                responsive
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={perPage}
                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                onChangeRowsPerPage={(newPerPage, newPage) => {
                    onPageChange(newPage);
                    onPerPageChange(newPerPage, newPage);
                }}
                onChangePage={onPageChange}
                fixedHeader
                fixedHeaderScrollHeight="calc(100vh - 420px)"
                customStyles={getTableStyles(mode)}
                noDataComponent={
                    <div className="text-center py-12">
                        <Store className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {searchTerm ? 'No matching branches' : 'No branches found'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first branch.'}
                        </p>
                    </div>
                }
            />
        </div>
    );
};

export default DesktopBranch;
