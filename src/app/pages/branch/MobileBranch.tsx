import { FunctionComponent } from 'react';
import { Store } from 'lucide-react';
import MobilePagination from '../../components/MobilePagination';
import { BranchMobileList } from './partials/BranchMobileCard';
import { BranchPermissions } from '../../hooks/useBranchPermissions';

interface MobileBranchProps {
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
    permissions: BranchPermissions;
}

const MobileBranch: FunctionComponent<MobileBranchProps> = ({
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
    permissions,
}) => {
    return (
        <div className="overflow-hidden">
            {isLoading ? (
                <BranchMobileList
                    branches={[]}
                    onEdit={onEdit}
                    onStatusToggle={onStatusToggle}
                    onDelete={onDelete}
                    isLoading={true}
                    permissions={permissions}
                />
            ) : branches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Store className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                        {searchTerm ? 'No matching branches' : 'No branches yet'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                        {searchTerm
                            ? "Try adjusting your search to find branches."
                            : permissions.canCreateBranch
                                ? "Add your first branch to get started."
                                : "No branches are available."
                        }
                    </p>
                </div>
            ) : (
                <>
                    <BranchMobileList
                        branches={branches}
                        onEdit={onEdit}
                        onStatusToggle={onStatusToggle}
                        onDelete={onDelete}
                        isLoading={false}
                        permissions={permissions}
                    />

                    <MobilePagination page={page} totalRows={totalRows} perPage={perPage} onPageChange={onPageChange} />
                </>
            )}
        </div>
    );
};

export default MobileBranch;
