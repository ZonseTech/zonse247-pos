import { FunctionComponent, useState, useEffect, useRef } from 'react';
import { Search, Monitor, X, Check } from 'lucide-react';
import terminalService from '../../../services/terminal.service';
import { Notify } from 'notiflix';

interface TerminalSearchProps {
    value?: string;
    onChange: (terminalId: string, terminalLabel?: string) => void;
    branchId?: string;
    tenantId?: string;
    error?: string;
    touched?: boolean;
}

const TerminalSearch: FunctionComponent<TerminalSearchProps> = ({
    value,
    onChange,
    branchId,
    tenantId,
    error,
    touched
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
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
        if (value && !selectedTerminal) {
            loadTerminalById(value);
        }
    }, [value]);

    // Clear selection when branchId changes
    useEffect(() => {
        if (!branchId) {
            setSelectedTerminal(null);
            setTerminals([]);
        }
    }, [branchId]);

    const loadTerminalById = async (terminalId: string) => {
        try {
            const terminal = await terminalService.show(terminalId);
            setSelectedTerminal(terminal);
        } catch (error) {
            console.error('Error loading terminal:', error);
        }
    };

    const searchTerminals = async (term: string) => {
        if (!branchId) {
            setTerminals([]);
            return;
        }

        setLoading(true);
        try {
            const results = await terminalService.search(term, { branchId, tenantId });
            setTerminals(results);
        } catch (error: any) {
            console.error('Error searching terminals:', error);
            Notify.failure('Failed to search terminals');
            setTerminals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (isOpen) {
                searchTerminals(searchTerm);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchTerm, isOpen, branchId, tenantId]);

    const handleSelectTerminal = (terminal: Terminal) => {
        setSelectedTerminal(terminal);
        onChange(terminal.terminalId, terminal.terminalLabel);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClearSelection = () => {
        setSelectedTerminal(null);
        onChange('', '');
        setSearchTerm('');
    };

    const handleInputClick = () => {
        if (!branchId) {
            Notify.warning('Please select a branch first');
            return;
        }
        setIsOpen(true);
    };

    const getActivationStatusColor = (status?: TerminalActivationStatus): string => {
        switch (status) {
            case 'ACTIVATED':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
            case 'PENDING':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
            case 'DEACTIVATED':
                return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
            case 'SUSPENDED':
                return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
            case 'BLOCKED':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Terminal (Optional)
            </label>

            {selectedTerminal ? (
                <div className="flex items-center justify-between p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-sky-100 dark:bg-sky-800 rounded-full flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-sky-500 dark:text-sky-300" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedTerminal.terminalLabel}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedTerminal.terminalCode}
                                {selectedTerminal.activationStatus && (
                                    <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${getActivationStatusColor(selectedTerminal.activationStatus)}`}>
                                        {selectedTerminal.activationStatus}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClearSelection}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    className={`relative cursor-pointer ${!branchId ? 'opacity-60' : ''}`}
                    onClick={handleInputClick}
                >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={branchId ? "Search terminals..." : "Select a branch first"}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 
                            ${error && touched
                                ? 'border-red-500 dark:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }
                            text-gray-900 dark:text-gray-100 placeholder-gray-400 
                            focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400
                            ${!branchId ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={!branchId}
                        readOnly={!isOpen}
                    />
                </div>
            )}

            {error && touched && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}

            {/* Dropdown */}
            {isOpen && branchId && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500 mx-auto"></div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Searching...</p>
                        </div>
                    ) : terminals.length > 0 ? (
                        <ul>
                            {terminals.map((terminal) => (
                                <li
                                    key={terminal.terminalId}
                                    className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0
                                        ${value === terminal.terminalId ? 'bg-sky-50 dark:bg-sky-900/20' : ''}`}
                                    onClick={() => handleSelectTerminal(terminal)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                <Monitor className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {terminal.terminalLabel}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {terminal.terminalCode}
                                                    {terminal.deviceId && ` • ${terminal.deviceId}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {terminal.activationStatus && (
                                                <span className={`px-2 py-0.5 rounded text-xs ${getActivationStatusColor(terminal.activationStatus)}`}>
                                                    {terminal.activationStatus}
                                                </span>
                                            )}
                                            {value === terminal.terminalId && (
                                                <Check className="w-4 h-4 text-sky-500" />
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center">
                            <Monitor className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'No terminals found' : 'Start typing to search terminals'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TerminalSearch;
