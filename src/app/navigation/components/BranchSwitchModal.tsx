import type { FunctionComponent } from 'react';
import { Building2, Check, RefreshCw } from 'lucide-react';
import classNames from 'classnames';
import { useBranch } from '../../context/BranchContext';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export interface BranchSwitchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBranchSwitch?: () => void;
}

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'inactive':
            return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
        case 'suspended':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
};

const BranchSwitchModal: FunctionComponent<BranchSwitchModalProps> = ({
    isOpen,
    onClose,
    onBranchSwitch,
}) => {
    const { currentBranch, accessibleBranches, switchBranch, isLoading: isSwitching, refreshBranches } = useBranch();

    const handleSelectBranch = async (branchId: string) => {
        const success = await switchBranch(branchId);
        if (success) {
            onClose();
            onBranchSwitch?.();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Switch Branch"
            size="md"
        >
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select a branch to switch to
                    </p>
                    <button
                        onClick={() => refreshBranches()}
                        disabled={isSwitching}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Refresh branches"
                    >
                        <RefreshCw className={classNames(
                            "w-4 h-4 text-gray-500 dark:text-gray-400",
                            isSwitching && "animate-spin"
                        )} />
                    </button>
                </div>

                <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto -mx-4 px-4">
                    {accessibleBranches.length === 0 ? (
                        <div className="py-8 text-center">
                            <Building2 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No branches available</p>
                        </div>
                    ) : (
                        accessibleBranches.map((branch) => {
                            const isCurrentBranch = currentBranch?.branchId === branch.branchId;
                            const isDisabled = branch.status !== 'active' || isSwitching;

                            return (
                                <button
                                    key={branch.branchId}
                                    onClick={() => !isCurrentBranch && !isDisabled && handleSelectBranch(branch.branchId)}
                                    disabled={isCurrentBranch || isDisabled}
                                    className={classNames(
                                        "flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 w-full",
                                        isCurrentBranch
                                            ? "bg-sky-50 dark:bg-sky-900/20 border-2 border-sky-500"
                                            : isDisabled
                                                ? "bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed"
                                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 active:scale-[0.98]"
                                    )}
                                >
                                    <div className={classNames(
                                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                        isCurrentBranch
                                            ? "bg-sky-100 dark:bg-sky-800/50"
                                            : "bg-gray-100 dark:bg-gray-700"
                                    )}>
                                        <Building2 className={classNames(
                                            "w-5 h-5",
                                            isCurrentBranch
                                                ? "text-sky-500 dark:text-sky-400"
                                                : "text-gray-500 dark:text-gray-400"
                                        )} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={classNames(
                                                "text-sm font-semibold truncate",
                                                isCurrentBranch
                                                    ? "text-sky-700 dark:text-sky-300"
                                                    : "text-gray-900 dark:text-white"
                                            )}>
                                                {branch.branchName}
                                            </p>
                                            <span className={classNames(
                                                "px-1.5 py-0.5 text-[10px] font-medium rounded-full capitalize",
                                                getStatusBadgeClass(branch.status)
                                            )}>
                                                {branch.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {branch.phoneNumber || branch.email || branch.branchCode}
                                        </p>
                                    </div>

                                    {isCurrentBranch && (
                                        <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        theme="neutral"
                        layout="outline"
                        onClick={onClose}
                        block
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default BranchSwitchModal;
