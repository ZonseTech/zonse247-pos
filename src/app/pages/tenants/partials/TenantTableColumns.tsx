import { TableColumn } from 'react-data-table-component';
import { Mail, Phone, Globe, Edit2, Trash2, Eye, Ban, CheckCircle2 } from 'lucide-react';
import { Badge, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';
import { DEFAULT_SEED_KEY } from '../../../constants';
import { HiOutlineMenuAlt4 } from 'react-icons/hi';

const statusColorMap: Record<string, 'green' | 'amber' | 'red' | 'gray'> = {
    active: 'green',
    pending: 'amber',
    suspended: 'red',
    cancelled: 'gray',
};

interface TenantActionsProps {
    tenant: Tenant;
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    onStatusToggle: (id: string, status: string) => void;
    onDelete: (id: string, name: string) => void;
}

export const TenantActions: React.FC<TenantActionsProps> = ({
    tenant,
    onView,
    onEdit,
    onStatusToggle,
    onDelete
}) => {
    const isSystemTenant = tenant.tenantId === DEFAULT_SEED_KEY;

    return (
        <Flex align="center" gap="2">
            <Tooltip content="View tenant details">
                <IconButton variant="ghost" size="1" onClick={() => onView(tenant.tenantId)}>
                    <Eye className="w-4 h-4" />
                </IconButton>
            </Tooltip>

            <Tooltip content="Edit tenant">
                <IconButton variant="ghost" size="1" disabled={isSystemTenant} onClick={() => onEdit(tenant.tenantId)}>
                    <Edit2 className="w-4 h-4" />
                </IconButton>
            </Tooltip>

            <Tooltip content={tenant.status === 'active' ? 'Suspend tenant' : 'Activate tenant'}>
                <IconButton
                    variant="ghost"
                    color={tenant.status === 'active' ? 'red' : 'green'}
                    size="1"
                    disabled={isSystemTenant}
                    onClick={() => onStatusToggle(tenant.tenantId, tenant.status)}
                >
                    {tenant.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </IconButton>
            </Tooltip>

            <Tooltip content="Delete tenant">
                <IconButton variant="ghost" color="red" size="1" disabled={isSystemTenant} onClick={() => onDelete(tenant.tenantId, tenant.businessName)}>
                    <Trash2 className="w-4 h-4" />
                </IconButton>
            </Tooltip>
        </Flex>
    );
};

export const getTenantColumns = (
    onView: (id: string) => void,
    onEdit: (id: string) => void,
    onStatusToggle: (id: string, status: string) => void,
    onDelete: (id: string, name: string) => void
): TableColumn<Tenant>[] => [
        {
            name: "Business Name",
            grow: 2,
            cell: (row) => (
                <Flex direction="column" gap="1">
                    <Text as="p" size="2" weight="medium">{row?.businessName}</Text>
                    <Text as="p" size="1" color="gray">ID: {row?.tin ?? row?.tenantCode}</Text>
                </Flex>
            ),
        },
        {
            name: 'Tenant',
            grow: 2,
            cell: (row) => (
                <Flex direction="column" gap="1">
                    <Text size="2" weight="medium">{row?.ownerName}</Text>
                    <Flex align="center" gap="1">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <Text size="1" color="gray">{row?.email}</Text>
                    </Flex>
                    <Flex align="center" gap="1">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <Text size="1" color="gray">{row?.phoneNumber}</Text>
                    </Flex>
                </Flex>
            )
        },
        {
            name: 'Location',
            cell: (row) => (
                <Flex direction="column" gap="1">
                    {row?.country && (
                        <Flex align="center" gap="1">
                            <Globe className="w-3 h-3 text-gray-500" />
                            <Text size="2">{row.country}</Text>
                        </Flex>
                    )}
                    <Text size="1" color="gray">{row?.address}</Text>
                </Flex>
            )
        },
        {
            name: 'Status',
            width: '110px',
            cell: (row) => (
                <Badge variant="soft" color={statusColorMap[row?.status] || 'gray'} radius="full">
                    {row?.status?.charAt(0)?.toUpperCase() + row?.status?.slice(1)}
                </Badge>
            )
        },
        {
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500' />,
            width: '170px',
            cell: (row) => (
                <TenantActions
                    tenant={row}
                    onView={onView}
                    onEdit={onEdit}
                    onStatusToggle={onStatusToggle}
                    onDelete={onDelete}
                />
            )
        }
    ];
