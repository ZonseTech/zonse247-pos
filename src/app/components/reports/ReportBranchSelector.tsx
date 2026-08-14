import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronDown, Layers } from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { ALL_BRANCHES_VALUE } from '../../hooks/useReportsSummary';

interface ReportBranchSelectorProps {
    /** Selected branchId, or ALL_BRANCHES_VALUE for the cumulative view */
    value: string;
    onChange: (branchId: string) => void;
    compact?: boolean;
    /** Translucent style for use on colored/dark header backgrounds (e.g. the mobile sky header) */
    theme?: 'default' | 'onColor';
    className?: string;
}

/**
 * Report-scoped branch filter. Unlike BranchSwitcher, this never changes the
 * user's active working branch (no switchBranch()/reload) - it's local state
 * the caller threads into useReportsSummary. Hidden entirely when the user
 * only has access to one branch, since there's nothing to switch between.
 */
const ReportBranchSelector: FunctionComponent<ReportBranchSelectorProps> = ({
    value,
    onChange,
    compact = false,
    theme = 'default',
    className = '',
}) => {
    const { accessibleBranches } = useBranch();
    const [isOpen, setIsOpen] = useState(false);
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

    if (accessibleBranches.length <= 1) {
        return null;
    }

    const selectedBranch = accessibleBranches.find((b) => b.branchId === value);
    const label = value === ALL_BRANCHES_VALUE ? 'All Branches' : (selectedBranch?.branchName || 'All Branches');
    const isOnColor = theme === 'onColor';

    const triggerClasses = isOnColor
        ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600';

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex items-center gap-2 rounded-lg transition-colors ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm font-medium'} ${triggerClasses}`}
            >
                <Layers className="w-4 h-4 flex-shrink-0" />
                <span className="truncate max-w-[140px]">{label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">View performance for</span>
                    </div>
                    <ul className="max-h-72 overflow-y-auto py-2">
                        <li>
                            <button
                                type="button"
                                onClick={() => { onChange(ALL_BRANCHES_VALUE); setIsOpen(false); }}
                                className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${value === ALL_BRANCHES_VALUE ? 'bg-sky-50 dark:bg-sky-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${value === ALL_BRANCHES_VALUE ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-500 dark:text-sky-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                    <Layers className="w-4 h-4" />
                                </div>
                                <span className={`flex-1 text-sm font-medium ${value === ALL_BRANCHES_VALUE ? 'text-sky-900 dark:text-sky-100' : 'text-gray-900 dark:text-white'}`}>
                                    All Branches
                                </span>
                                {value === ALL_BRANCHES_VALUE && <Check className="w-4 h-4 text-sky-500 dark:text-sky-400" />}
                            </button>
                        </li>
                        {accessibleBranches.map((branch) => {
                            const isActive = branch.branchId === value;
                            return (
                                <li key={branch.branchId}>
                                    <button
                                        type="button"
                                        onClick={() => { onChange(branch.branchId); setIsOpen(false); }}
                                        className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${isActive ? 'bg-sky-50 dark:bg-sky-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-500 dark:text-sky-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <span className={`flex-1 text-sm font-medium truncate ${isActive ? 'text-sky-900 dark:text-sky-100' : 'text-gray-900 dark:text-white'}`}>
                                            {branch.branchName}
                                        </span>
                                        {isActive && <Check className="w-4 h-4 text-sky-500 dark:text-sky-400" />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ReportBranchSelector;
