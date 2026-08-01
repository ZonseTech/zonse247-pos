import { FunctionComponent, useState, useEffect, useRef } from 'react';
import { Search, Building, X, Check } from 'lucide-react';
import branchService from '../../../services/branch.service';
import { Notify } from 'notiflix';

interface BranchSearchProps {
    value: string;
    onChange: (branchId: string, branchName: string) => void;
    tenantId?: string;
    error?: string;
    touched?: boolean;
    disabled?: boolean;
    disabledMessage?: string;
    required?: boolean;
    label?: string;
    placeholder?: string;
}

const BranchSearch: FunctionComponent<BranchSearchProps> = ({
    value,
    onChange,
    tenantId,
    error,
    touched,
    disabled = false,
    disabledMessage,
    required = true,
    label = 'Branch',
    placeholder,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
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

    useEffect(() => {
        if (value && !selectedBranch) {
            loadBranchById(value);
        } else if (!value && selectedBranch) {
            setSelectedBranch(null);
        }
    }, [value]);

    // Reset when tenant changes
    useEffect(() => {
        setSelectedBranch(null);
        setBranches([]);
    }, [tenantId]);

    const loadBranchById = async (branchId: string) => {
        try {
            const branch = await branchService.show(branchId);
            setSelectedBranch(branch);
        } catch (error) {
            console.error('Error loading branch:', error);
        }
    };

    const searchBranches = async (term: string) => {
        if (!tenantId) {
            setBranches([]);
            return;
        }

        setLoading(true);
        try {
            const results = await branchService.search(term, { tenantId });
            setBranches(results);
        } catch (error: any) {
            console.error('Error searching branches:', error);
            Notify.failure('Failed to search branches');
            setBranches([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (isOpen) {
                searchBranches(searchTerm);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchTerm, isOpen, tenantId]);

    const handleSelectBranch = (branch: Branch) => {
        setSelectedBranch(branch);
        onChange(branch.branchId, branch.branchName);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClearSelection = () => {
        setSelectedBranch(null);
        onChange('', '');
        setSearchTerm('');
    };

    const handleInputClick = () => {
        if (!tenantId) {
            Notify.warning('Please select a tenant first');
            return;
        }
        setIsOpen(true);
        if (!searchTerm) {
            searchBranches('');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
                {selectedBranch ? (
                    <div className={`flex items-center justify-between p-3 border rounded-sm ${disabled ? 'bg-gray-100 dark:bg-gray-600 border-gray-200 dark:border-gray-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'}`}>
                        <div className="flex items-center space-x-3 flex-1">
                            <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${disabled ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                    {selectedBranch.branchName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {selectedBranch.branchCode} • {selectedBranch.isActive ? 'Active' : 'Inactive'}
                                </p>
                                {disabled && disabledMessage && (
                                    <p className="text-xs text-sky-500 dark:text-sky-400 mt-1">
                                        {disabledMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleClearSelection}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={handleInputClick}
                            placeholder={disabled ? "Branch auto-assigned" : (tenantId ? (placeholder || "Search for a branch...") : "Select tenant first...")}
                            disabled={disabled || !tenantId}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:text-white ${disabled
                                ? 'bg-gray-100 dark:bg-gray-600 border-gray-200 dark:border-gray-500 opacity-50 cursor-not-allowed'
                                : 'dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                } ${error && touched && !disabled
                                    ? 'border-red-500 dark:border-red-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                )}
            </div>

            {error && touched && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
            )}

            {isOpen && !selectedBranch && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
                        </div>
                    ) : branches.length > 0 ? (
                        <ul>
                            {branches.map((branch) => (
                                <li key={branch.branchId}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectBranch(branch)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                                    >
                                        <Building className="w-5 h-5 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {branch.branchName}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {branch.branchCode} • {branch.isActive ? 'Active' : 'Inactive'}
                                            </p>
                                            {branch.city && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    {branch.city}
                                                </p>
                                            )}
                                        </div>
                                        <Check className="w-4 h-4 text-transparent" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : searchTerm ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No branches found matching "{searchTerm}"
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            {tenantId ? 'Start typing to search for branches' : 'Please select a tenant first'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BranchSearch;
