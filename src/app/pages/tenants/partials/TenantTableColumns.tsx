import { Fragment } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Building2, Globe, Mail, Phone, Edit2, Trash2 } from 'lucide-react';
import { getSubscriptionStatusColor, getStatusColor } from '../../../utils/tenant-status';
import { DEFAULT_SEED_KEY } from '../../../constants';
import { HiOutlineMenuAlt4 } from 'react-icons/hi';

interface TenantActionsProps {
    tenant: Tenant;
    onEdit: (id: string) => void;
    onStatusToggle: (id: string, status: string) => void;
    onDelete: (id: string, name: string) => void;
}

export const TenantActions: React.FC<TenantActionsProps> = ({
    tenant,
    onEdit,
    onStatusToggle,
    onDelete
}) => (
    <div className="flex items-center space-x-2">
        <button
            onClick={() => onEdit(tenant.tenantId)}
            disabled={tenant.tenantId === DEFAULT_SEED_KEY}
            className={`p-1 rounded transition-colors ${tenant.tenantId === DEFAULT_SEED_KEY
                ? 'text-gray-500'
                : 'text-sky-500 hover:text-sky-800'
                }`}
            title="Edit tenant"
        >
            <Edit2 className="w-4 h-4" />
        </button>

        <button
            onClick={() => onStatusToggle(tenant.tenantId, tenant.status)}
            disabled={tenant.tenantId === DEFAULT_SEED_KEY}
            className={`text-xs px-2 py-1 rounded transition-colors ${tenant.tenantId === DEFAULT_SEED_KEY
                ? 'text-gray-500 bg-gray-100'
                : tenant.status === 'active'
                    ? 'text-red-500 hover:text-red-800 bg-red-50 hover:bg-red-100'
                    : 'text-green-500 hover:text-green-800 bg-green-50 hover:bg-green-100'
                }`}
            title={tenant.status === 'active' ? 'Suspend tenant' : 'Activate tenant'}
        >
            {tenant.status === 'active' ? 'Suspend' : 'Activate'}
        </button>

        <button
            onClick={() => onDelete(tenant.tenantId, tenant.businessName)}
            disabled={tenant.tenantId === DEFAULT_SEED_KEY}
            className={`p-1 rounded transition-colors ${tenant.tenantId === DEFAULT_SEED_KEY
                ? 'text-gray-500'
                : 'text-red-500 hover:text-red-800'
                }`}
            title="Delete tenant"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    </div>
);

export const getTenantColumns = (
    onEdit: (id: string) => void,
    onStatusToggle: (id: string, status: string) => void,
    onDelete: (id: string, name: string) => void
): TableColumn<Tenant>[] => [
        {
            name: "Tenant",
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-sky-500" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                                {row?.businessName}
                            </div>
                            <div className="text-sm text-gray-500">
                                ID: {row?.tin ?? row?.tenantCode}
                            </div>
                        </div>
                    </div>
                </Fragment>
            ),
        },
        {
            name: 'Owner & Contact',
            cell: (row) => (
                <Fragment>
                    <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                            {row?.ownerName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {row?.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {row?.phoneNumber}
                        </div>
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Location',
            cell: (row) => (
                <Fragment>
                    <div>
                        {row?.country && (
                            <div className="text-sm text-gray-900 flex items-center">
                                <Globe className="w-3 h-3 mr-1" />
                                {row?.country}
                            </div>
                        )}
                        <div className="text-sm text-gray-500">
                            {row?.address}
                        </div>
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Subscription',
            cell: (row) => (
                <Fragment>
                    <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionStatusColor(row?.subscriptionStatus)}`}>
                            {row?.subscriptionStatus?.charAt(0)?.toUpperCase() + row?.subscriptionStatus?.slice(1)}
                        </span>
                        {row?.subscriptionStatus === 'trial' && row?.trialEndsAt && (
                            <div className="text-xs text-gray-500 mt-1">
                                Ends: {new Date(row.trialEndsAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row?.status)}`}>
                        {row?.status?.charAt(0)?.toUpperCase() + row?.status?.slice(1)}
                    </span>
                </Fragment>
            )
        },
        {
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500' />,
            cell: (row) => (
                <TenantActions
                    tenant={row}
                    onEdit={onEdit}
                    onStatusToggle={onStatusToggle}
                    onDelete={onDelete}
                />
            )
        }
    ];