import { FunctionComponent, useState, useEffect, useRef } from 'react';
import { Search, Shield, X, Check } from 'lucide-react';
import roleService from '../../../services/role.service';
import { Notify } from 'notiflix';
import { ROLE_IDS } from '../../../constants/roles';

interface Role {
    roleId: string;
    displayName: string;
    name: string;
    description?: string;
    isSystemRole?: boolean;
    isActive?: boolean;
}

interface RoleSearchProps {
    selectedRoleId?: string;
    onRoleSelect: (role: Role | null) => void;
    tenantId?: string;
    disabled?: boolean;
    excludeAdminRoles?: boolean;
    error?: string;
    touched?: boolean;
}

// Admin roles that should be excluded from selection
const ADMIN_ROLE_IDS = [
    ROLE_IDS.SUPER_ADMIN,
    ROLE_IDS.ADMIN,
    ROLE_IDS.SUPPORT_ADMIN,
];

export const RoleSearch: FunctionComponent<RoleSearchProps> = ({
    selectedRoleId,
    onRoleSelect,
    tenantId,
    disabled = false,
    excludeAdminRoles = true,
    error,
    touched,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roles, setRoles] = useState<Role[]>([]);
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
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
        if (tenantId) {
            loadRoles();
        } else {
            setRoles([]);
            setFilteredRoles([]);
        }
    }, [tenantId]);

    useEffect(() => {
        if (selectedRoleId && roles.length > 0) {
            const role = roles.find((r) => r.roleId === selectedRoleId);
            if (role) {
                setSelectedRole(role);
            }
        } else if (!selectedRoleId) {
            setSelectedRole(null);
        }
    }, [selectedRoleId, roles]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (searchTerm) {
                const lowerValue = searchTerm.toLowerCase();
                const filtered = roles.filter((role) =>
                    role.displayName?.toLowerCase().includes(lowerValue) ||
                    role.name?.toLowerCase().includes(lowerValue) ||
                    role.description?.toLowerCase().includes(lowerValue)
                );
                setFilteredRoles(filtered);
            } else {
                setFilteredRoles(roles);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchTerm, roles]);

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const response = await roleService.list();
            let roleData = response.data || [];

            if (excludeAdminRoles) {
                roleData = roleData.filter((role: Role) =>
                    !ADMIN_ROLE_IDS.includes(role.roleId as typeof ADMIN_ROLE_IDS[number])
                );
            }

            setRoles(roleData);
            setFilteredRoles(roleData);
        } catch (error: any) {
            console.error('Error loading roles:', error);
            Notify.failure(error?.response?.data?.message || 'Failed to load roles');
            setRoles([]);
            setFilteredRoles([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectRole = (role: Role) => {
        if (role.isActive === false) return;
        setSelectedRole(role);
        onRoleSelect(role);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClearSelection = () => {
        setSelectedRole(null);
        onRoleSelect(null);
        setSearchTerm('');
    };

    const handleInputClick = () => {
        if (!tenantId || disabled) {
            if (!tenantId) {
                Notify.warning('Please select a tenant first');
            }
            return;
        }
        setIsOpen(true);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                {selectedRole ? (
                    <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center space-x-3 flex-1">
                            <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {selectedRole.displayName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {selectedRole.name}
                                    {selectedRole.isSystemRole && ' • System Role'}
                                </p>
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
                            placeholder={tenantId ? "Search for a role..." : "Select tenant first..."}
                            disabled={!tenantId || disabled}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${error && touched
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

            {isOpen && !selectedRole && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
                        </div>
                    ) : filteredRoles.length > 0 ? (
                        <ul>
                            {filteredRoles.map((role) => (
                                <li key={role.roleId}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectRole(role)}
                                        disabled={role.isActive === false}
                                        className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors ${role.isActive === false
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <Shield className="w-5 h-5 text-gray-400" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {role.displayName}
                                                </p>
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
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {role.name}
                                            </p>
                                            {role.description && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    {role.description}
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
                            No roles found matching "{searchTerm}"
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            {tenantId ? 'No roles available' : 'Please select a tenant first'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};