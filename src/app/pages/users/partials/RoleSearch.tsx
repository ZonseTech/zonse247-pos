import { FunctionComponent, useState, useEffect, useRef } from 'react';
import { Search, Shield, X, Check } from 'lucide-react';
import roleService from '../../../services/role.service';
import { Notify } from 'notiflix';

interface RoleSearchProps {
    selectedRoleId?: string;
    onRoleSelect: (role: Role | null) => void;
    tenantId?: string;
    disabled?: boolean;
}

export const RoleSearch: FunctionComponent<RoleSearchProps> = ({
    selectedRoleId,
    onRoleSelect,
    tenantId,
    disabled = false,
}) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadRoles();
    }, [tenantId]);

    useEffect(() => {
        if (selectedRoleId && roles.length > 0) {
            const role = roles.find((r) => r.roleId === selectedRoleId);
            if (role) {
                setSelectedRole(role);
                setSearchTerm(role.displayName);
            }
        }
    }, [selectedRoleId, roles]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const response = await roleService.list();
            let roleData = response.data || [];

            setRoles(roleData);
            setFilteredRoles(roleData);
        } catch (error: any) {
            console.error('Error loading roles:', error);
            Notify.failure(error?.response?.data?.message || 'Failed to load roles');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setIsDropdownOpen(true);

        if (!value.trim()) {
            setFilteredRoles(roles);
            return;
        }

        const lowerValue = value.toLowerCase();
        const filtered = roles.filter(
            (role) =>
                role.displayName?.toLowerCase().includes(lowerValue) ||
                role.name?.toLowerCase().includes(lowerValue) ||
                role.description?.toLowerCase().includes(lowerValue)
        );
        setFilteredRoles(filtered);
    };

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
        setSearchTerm(role.displayName);
        setIsDropdownOpen(false);
        onRoleSelect(role);
    };

    const handleClear = () => {
        setSearchTerm('');
        setSelectedRole(null);
        setFilteredRoles(roles);
        setIsDropdownOpen(false);
        onRoleSelect(null);
    };

    const handleInputFocus = () => {
        if (!disabled) {
            setIsDropdownOpen(true);
            if (!searchTerm) {
                setFilteredRoles(roles);
            }
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>

                {selectedRole ? (
                    <div className="flex items-center justify-between w-full pl-10 pr-3 py-3 border-2 border-blue-500 dark:border-blue-400 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <div className="flex items-center space-x-2 flex-1">
                            <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {selectedRole.displayName}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {selectedRole.name}
                                    {selectedRole.isSystemRole && ' • System Role'}
                                </span>
                            </div>
                        </div>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="ml-2 p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors duration-200"
                            >
                                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        )}
                    </div>
                ) : (
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={handleInputFocus}
                        disabled={disabled || isLoading}
                        placeholder={disabled ? 'Select a tenant first...' : 'Search for a role...'}
                        className={`block w-full pl-10 pr-3 py-3 border-2 rounded-lg leading-5 transition-all duration-200 sm:text-sm
                            ${disabled
                                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
                            }
                            text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
                    />
                )}
            </div>

            {isDropdownOpen && !selectedRole && !disabled && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-gray-300 dark:border-gray-600 max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        </div>
                    ) : filteredRoles.length > 0 ? (
                        <div className="py-2">
                            {filteredRoles.map((role) => (
                                <button
                                    key={role.roleId}
                                    type="button"
                                    onClick={() => handleRoleSelect(role)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-3 group"
                                >
                                    <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {role.displayName}
                                            </h4>
                                            <div className="flex gap-1">
                                                {role.isSystemRole && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                        System
                                                    </span>
                                                )}
                                                {role.isActive === false && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                            {role.name}
                                        </p>
                                        {role.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                {role.description}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center">
                            <Shield className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'No roles found matching your search' : 'No roles available'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
