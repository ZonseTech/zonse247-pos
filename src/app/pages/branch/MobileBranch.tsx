import { FunctionComponent } from 'react';
import { Store } from 'lucide-react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { BranchMobileList } from './partials/BranchMobileCard';

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
                            : "Add your first branch to get started."
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
                    />

                    {/* Mobile Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            Page {page} of {Math.ceil(totalRows / perPage) || 1} ({totalRows} total)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange(page - 1)}
                                disabled={page <= 1}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiOutlineChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {page}
                            </span>
                            <button
                                onClick={() => onPageChange(page + 1)}
                                disabled={page >= Math.ceil(totalRows / perPage)}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiOutlineChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MobileBranch;
