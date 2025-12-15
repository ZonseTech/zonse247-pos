import { FunctionComponent, useState, useEffect, useRef } from 'react';
import { Search, Building2, X, Check } from 'lucide-react';
import tenantsService from '../../../services/tenant.service';
import { Notify } from 'notiflix';

interface TenantSearchProps {
    value: string;
    onChange: (tenantId: string, tenantName: string) => void;
    error?: string;
    touched?: boolean;
}

const TenantSearch: FunctionComponent<TenantSearchProps> = ({
    value,
    onChange,
    error,
    touched
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
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
        if (value && !selectedTenant) {
            loadTenantById(value);
        }
    }, [value]);

    const loadTenantById = async (tenantId: string) => {
        try {
            const tenant = await tenantsService.show(tenantId);
            setSelectedTenant(tenant);
        } catch (error) {
            console.error('Error loading tenant:', error);
        }
    };

    const searchTenants = async (term: string) => {
        if (!term.trim()) {
            setTenants([]);
            return;
        }

        setLoading(true);
        try {
            const results = await tenantsService.search(term);
            setTenants(results);
        } catch (error: any) {
            console.error('Error searching tenants:', error);
            Notify.failure('Failed to search tenants');
            setTenants([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (isOpen) {
                searchTenants(searchTerm);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchTerm, isOpen]);

    const handleSelectTenant = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        onChange(tenant.tenantId, tenant.businessName);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClearSelection = () => {
        setSelectedTenant(null);
        onChange('', '');
        setSearchTerm('');
    };

    const handleInputClick = () => {
        setIsOpen(true);
        if (!searchTerm) {
            searchTenants('');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tenant <span className="text-red-500">*</span>
            </label>

            <div className="relative">
                {selectedTenant ? (
                    <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center space-x-3 flex-1">
                            <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {selectedTenant.businessName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {selectedTenant.tenantId}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClearSelection}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={handleInputClick}
                            placeholder="Search for a tenant..."
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${error && touched
                                ? 'border-red-500 dark:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                                }`}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                )}
            </div>

            {error && touched && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {isOpen && !selectedTenant && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                    ) : tenants.length > 0 ? (
                        <ul>
                            {tenants.map((tenant) => (
                                <li key={tenant.tenantId}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectTenant(tenant)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                                    >
                                        <Building2 className="w-5 h-5 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {tenant.businessName}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {tenant.tenantId}
                                            </p>
                                            {tenant.email && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    {tenant.email}
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
                            No tenants found matching "{searchTerm}"
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            Start typing to search for tenants
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TenantSearch;
