import { FunctionComponent, useState, useEffect } from 'react';
import { Search, Shield, X, Check } from 'lucide-react';
import { Flex, Box, Text, Badge, Spinner, IconButton, ScrollArea, TextField } from '@radix-ui/themes';
import * as Popover from '@radix-ui/react-popover';
import roleService from '../../../services/role.service';
import { Notify } from 'notiflix';
import { ROLE_IDS } from '../../../constants/roles';
import { getErrorMessage } from '../../../utils/api-error-handler';

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
            Notify.failure(getErrorMessage(error, 'Failed to load roles'));
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

    const handleTriggerClick = () => {
        if (!tenantId || disabled) {
            if (!tenantId) {
                Notify.warning('Please select a tenant first');
            }
            return;
        }
        setIsOpen(true);
    };

    return (
        <Box>
            <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
                <Popover.Trigger asChild>
                    <div>
                        {selectedRole ? (
                            <Flex
                                align="center"
                                justify="between"
                                p="3"
                                className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                            >
                                <Flex align="center" gap="3" flexGrow="1">
                                    <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <Box>
                                        <Text as="p" size="2" weight="medium">
                                            {selectedRole.displayName}
                                        </Text>
                                        <Text as="p" size="1" color="gray">
                                            {selectedRole.name}
                                            {selectedRole.isSystemRole && ' • System Role'}
                                        </Text>
                                    </Box>
                                </Flex>
                                {!disabled && (
                                    <IconButton
                                        size="1"
                                        variant="ghost"
                                        color="gray"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClearSelection();
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </IconButton>
                                )}
                            </Flex>
                        ) : (
                            <Box className="relative" onClick={handleTriggerClick}>
                                <TextField.Root
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={tenantId ? "Search for a role..." : "Select tenant first..."}
                                    disabled={!tenantId || disabled}
                                    color={error && touched ? 'red' : undefined}
                                    size="2"
                                >
                                    <TextField.Slot>
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </TextField.Slot>
                                </TextField.Root>
                            </Box>
                        )}
                    </div>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        className="z-50 w-[var(--radix-popover-trigger-width)] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
                        sideOffset={4}
                        align="start"
                    >
                        <ScrollArea style={{ maxHeight: 240 }}>
                            {isLoading ? (
                                <Flex align="center" justify="center" p="4">
                                    <Spinner size="2" />
                                </Flex>
                            ) : filteredRoles.length > 0 ? (
                                <Flex direction="column">
                                    {filteredRoles.map((role) => (
                                        <button
                                            key={role.roleId}
                                            type="button"
                                            onClick={() => handleSelectRole(role)}
                                            disabled={role.isActive === false}
                                            className={`w-full text-left px-4 py-3 transition-colors ${role.isActive === false
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                                                }`}
                                        >
                                            <Flex align="center" gap="3">
                                                <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                <Box flexGrow="1" minWidth="0">
                                                    <Flex align="center" gap="2">
                                                        <Text size="2" weight="medium">
                                                            {role.displayName}
                                                        </Text>
                                                        {role.isSystemRole && (
                                                            <Badge size="1" variant="soft" color="purple">
                                                                System
                                                            </Badge>
                                                        )}
                                                        {role.isActive === false && (
                                                            <Badge size="1" variant="soft" color="red">
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </Flex>
                                                    <Text as="p" size="1" color="gray">
                                                        {role.name}
                                                    </Text>
                                                    {role.description && (
                                                        <Text as="p" size="1" color="gray" className="opacity-70">
                                                            {role.description}
                                                        </Text>
                                                    )}
                                                </Box>
                                                {selectedRole?.roleId === role.roleId && (
                                                    <Check className="w-4 h-4 text-sky-500 flex-shrink-0" />
                                                )}
                                            </Flex>
                                        </button>
                                    ))}
                                </Flex>
                            ) : searchTerm ? (
                                <Flex align="center" justify="center" p="4">
                                    <Text size="2" color="gray">
                                        No roles found matching "{searchTerm}"
                                    </Text>
                                </Flex>
                            ) : (
                                <Flex align="center" justify="center" p="4">
                                    <Text size="2" color="gray">
                                        {tenantId ? 'No roles available' : 'Please select a tenant first'}
                                    </Text>
                                </Flex>
                            )}
                        </ScrollArea>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>

            {error && touched && (
                <Text as="p" size="1" color="red" mt="1">{error}</Text>
            )}
        </Box>
    );
};