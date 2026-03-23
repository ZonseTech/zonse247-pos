import { FunctionComponent, memo, useContext } from 'react';
import {
    Building2,
    Mail,
    Phone,
    Globe,
    Hash,
    Calendar,
    Shield,
    CreditCard,
    User,
} from 'lucide-react';
import { Card, CardBody, ZonseThemeContext } from '../../../components';
import { getStatusColor, getSubscriptionStatusColor } from '../../../utils/tenant-status';
import dayjs from 'dayjs';

interface TenantDetailsTabProps {
    tenant: Tenant | null;
    loading: boolean;
}

const TenantInfoSkeleton: FunctionComponent = () => (
    <div className="animate-pulse space-y-6">
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
        </div>
    </div>
);

const InfoRow: FunctionComponent<{ icon: FunctionComponent<{ className?: string }>; label: string; value?: string | null }> = ({
    icon: Icon,
    label,
    value,
}) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
        <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {value || '—'}
            </p>
        </div>
    </div>
);

const TenantDetailsTab: FunctionComponent<TenantDetailsTabProps> = memo(({ tenant, loading }) => {
    useContext(ZonseThemeContext);

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <TenantInfoSkeleton />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No tenant information available</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header Card */}
            <Card>
                <CardBody>
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                        <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-8 h-8 text-sky-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {tenant.businessName}
                                </h2>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                                    {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                                </span>
                            </div>
                            {tenant.tradingName && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    Trading as: {tenant.tradingName}
                                </p>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Code: {tenant.tenantCode}
                                {tenant.tin && ` • TIN: ${tenant.tin}`}
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card>
                    <CardBody>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Contact Information
                        </h3>
                        <InfoRow icon={User} label="Owner" value={tenant.ownerName} />
                        <InfoRow icon={Mail} label="Email" value={tenant.email} />
                        <InfoRow icon={Phone} label="Phone" value={tenant.phoneNumber} />
                        <InfoRow icon={Globe} label="Country" value={tenant.country} />
                        <InfoRow icon={Hash} label="Address" value={tenant.address} />
                    </CardBody>
                </Card>

                {/* Business Information */}
                <Card>
                    <CardBody>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Business Information
                        </h3>
                        <InfoRow
                            icon={Building2}
                            label="Business Type"
                            value={tenant.businessType?.replace('_', ' ')}
                        />
                        <InfoRow icon={Hash} label="TIN" value={tenant.tin} />
                        <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700/50">
                            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Subscription Status</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getSubscriptionStatusColor(tenant.subscriptionStatus?.toLowerCase())}`}>
                                    {tenant.subscriptionStatus}
                                </span>
                            </div>
                        </div>
                        {tenant.isMraEnabled && (
                            <InfoRow
                                icon={Shield}
                                label="MRA Environment"
                                value={tenant.mraEnvironment || 'Not configured'}
                            />
                        )}
                        <InfoRow
                            icon={Calendar}
                            label="Registered"
                            value={tenant.registeredAt ? dayjs(tenant.registeredAt).format('DD MMM YYYY') : null}
                        />
                    </CardBody>
                </Card>
            </div>
        </div>
    );
});

TenantDetailsTab.displayName = 'TenantDetailsTab';

export default TenantDetailsTab;
