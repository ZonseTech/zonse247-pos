import { FunctionComponent, useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import roleService from '../../../services/role.service';
import { Notify } from 'notiflix';
import { Dropdown, DropdownOption } from '../../../components/Dropdown';
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
}) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (tenantId) {
            loadRoles();
        } else {
            setRoles([]);
        }
    }, [tenantId]);

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const response = await roleService.list();
            let roleData = response.data || [];

            // Filter out admin roles if excludeAdminRoles is true
            if (excludeAdminRoles) {
                roleData = roleData.filter((role: Role) =>
                    !ADMIN_ROLE_IDS.includes(role.roleId as typeof ADMIN_ROLE_IDS[number])
                );
            }

            setRoles(roleData);
        } catch (error: any) {
            console.error('Error loading roles:', error);
            Notify.failure(error?.response?.data?.message || 'Failed to load roles');
            setRoles([]);
        } finally {
            setIsLoading(false);
        }
    };

    const options: DropdownOption<Role>[] = roles.map((role) => {
        const badges = [];

        if (role.isSystemRole) {
            badges.push({
                text: 'System',
                color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            });
        }

        if (role.isActive === false) {
            badges.push({
                text: 'Inactive',
                color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            });
        }

        return {
            value: role.roleId,
            label: role.displayName,
            description: role.name + (role.description ? ` • ${role.description}` : ''),
            badges: badges.length > 0 ? badges : undefined,
            data: role,
            disabled: role.isActive === false
        };
    });

    const handleSelect = (option: DropdownOption<Role> | null) => {
        onRoleSelect(option?.data || null);
    };

    const filterOptions = (opts: DropdownOption<Role>[], searchTerm: string) => {
        const lowerValue = searchTerm.toLowerCase();
        return opts.filter((opt) => {
            const role = opt.data;
            return (
                role.displayName?.toLowerCase().includes(lowerValue) ||
                role.name?.toLowerCase().includes(lowerValue) ||
                role.description?.toLowerCase().includes(lowerValue)
            );
        });
    };

    const renderSelected = (option: DropdownOption<Role>) => {
        const role = option.data;
        return (
            <div className="flex items-start space-x-2 flex-1">
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {role.displayName}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {role.name}
                        {role.isSystemRole && ' • System Role'}
                    </span>
                </div>
            </div>
        );
    };

    const renderOption = (option: DropdownOption<Role>) => {
        const role = option.data;
        return (
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {role.displayName}
                    </h4>
                    {option.badges && option.badges.length > 0 && (
                        <div className="flex gap-1">
                            {option.badges.map((badge, idx) => (
                                <span
                                    key={idx}
                                    className={`px-2 py-0.5 text-xs rounded-full ${badge.color}`}
                                >
                                    {badge.text}
                                </span>
                            ))}
                        </div>
                    )}
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
        );
    };

    return (
        <Dropdown
            options={options}
            selectedValue={selectedRoleId}
            onSelect={handleSelect}
            disabled={disabled}
            placeholder="Search for a role..."
            disabledPlaceholder="Select a tenant first..."
            icon={Shield}
            searchable={true}
            searchPlaceholder="Search roles..."
            allowClear={true}
            isLoading={isLoading}
            loadingMessage="Loading roles..."
            emptyStateMessage="No roles available"
            noResultsMessage="No roles found matching your search"
            renderOption={renderOption}
            renderSelected={renderSelected}
            filterOptions={filterOptions}
            debounceDelay={300}
        />
    );
};