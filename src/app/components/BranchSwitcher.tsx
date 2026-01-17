import { FunctionComponent, useState, useEffect, useRef, Fragment } from 'react';
import { Building2, Check, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthProvider';

interface BranchSwitcherProps {
    compact?: boolean;
    className?: string;
    onBranchSwitch?: (branch: Branch) => void;
}

/**
 * Branch Switcher Component
 * 
 * Allows users to switch between their accessible branches.
 * Uses the zonse247-pos-api endpoints:
 * - POST /auth/switch-branch
 * - GET /auth/accessible-branches
 * 
 * @example
 * ```tsx
 * // In header/toolbar
 * <BranchSwitcher compact />
 * 
 * // Full size with callback
 * <BranchSwitcher onBranchSwitch={(branch) => refreshData()} />
 * ```
 */
const BranchSwitcher: FunctionComponent<BranchSwitcherProps> = ({
    compact = false,
    className = '',
    onBranchSwitch
}) => {
    const { user } = useAuth();
    const {
        currentBranch,
        accessibleBranches,
        isLoading,
        error,
        switchBranch,
        refreshBranches,
        hasAccessToBranch
    } = useBranch();

    const [isOpen, setIsOpen] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectBranch = async (branch: Branch) => {
        if (branch.branchId === currentBranch?.branchId) {
            setIsOpen(false);
            return;
        }

        setIsSwitching(true);
        const success = await switchBranch(branch.branchId);
        setIsSwitching(false);

        if (success) {
            setIsOpen(false);
            onBranchSwitch?.(branch);
        }
    };

    if (!user || accessibleBranches.length <= 1) {
        if (currentBranch && compact) {
            return (
                <div className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 ${className}`}>
                    <Building2 className="w-4 h-4" />
                    <span className="truncate max-w-[150px]">{currentBranch.branchName}</span>
                </div>
            );
        }
        return null;
    }

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading || isSwitching}
                className={`
                    flex items-center gap-2 transition-all duration-200
                    ${compact
                        ? 'px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                    ${isOpen ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}
                    ${(isLoading || isSwitching) ? 'opacity-50 cursor-wait' : ''}
                    text-gray-700 dark:text-gray-200
                `}
            >
                <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="truncate max-w-[150px]">
                    {currentBranch?.branchName || 'Select Branch'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Switch Branch
                        </span>
                        <button
                            type="button"
                            onClick={() => refreshBranches()}
                            disabled={isLoading}
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Refresh branches"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Branch List */}
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading && accessibleBranches.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <RefreshCw className="w-6 h-6 mx-auto animate-spin text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">Loading branches...</span>
                            </div>
                        ) : !Array.isArray(accessibleBranches) || accessibleBranches.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                No branches available
                            </div>
                        ) : (
                            <ul className="py-2">
                                {(Array.isArray(accessibleBranches) ? accessibleBranches : []).map((branch) => {
                                    const isActive = branch.branchId === currentBranch?.branchId;
                                    const isDefault = branch.branchId === user?.branchId;
                                    const isInactive = branch.status !== 'active';
                                    const isDisabled = isSwitching || isInactive;

                                    return (
                                        <li key={branch.branchId}>
                                            <button
                                                type="button"
                                                onClick={() => !isInactive && handleSelectBranch(branch)}
                                                disabled={isDisabled}
                                                title={isInactive ? `This branch is ${branch.status}` : undefined}
                                                className={`
                                                    w-full px-4 py-3 flex items-center gap-3 transition-colors
                                                    ${isActive
                                                        ? 'bg-blue-50 dark:bg-blue-900/30'
                                                        : isInactive
                                                            ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                    }
                                                    ${isSwitching ? 'opacity-50 cursor-wait' : ''}
                                                    ${isInactive ? 'opacity-60' : ''}
                                                `}
                                            >
                                                <div className={`
                                                    w-8 h-8 rounded-lg flex items-center justify-center
                                                    ${isActive
                                                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                                                        : isInactive
                                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                    }
                                                `}>
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`
                                                            text-sm font-medium
                                                            ${isActive
                                                                ? 'text-blue-900 dark:text-blue-100'
                                                                : isInactive
                                                                    ? 'text-gray-500 dark:text-gray-500'
                                                                    : 'text-gray-900 dark:text-white'
                                                            }
                                                        `}>
                                                            {branch.branchName}
                                                        </span>
                                                        {isDefault && (
                                                            <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                                                                Default
                                                            </span>
                                                        )}
                                                        {isInactive && (
                                                            <span className={`px-1.5 py-0.5 text-xs rounded ${branch.status === 'suspended'
                                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                                }`}>
                                                                {branch.status === 'suspended' ? 'Suspended' : 'Inactive'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`text-xs ${isInactive ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {branch.branchCode}
                                                        {branch.city && ` • ${branch.city}`}
                                                    </span>
                                                </div>
                                                {isActive && (
                                                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Footer Info */}
                    {accessibleBranches.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {accessibleBranches.length} branch{accessibleBranches.length !== 1 ? 'es' : ''} available
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BranchSwitcher;
