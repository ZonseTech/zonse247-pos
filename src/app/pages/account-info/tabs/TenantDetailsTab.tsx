import { FunctionComponent, ReactNode, memo, useState } from 'react';
import {
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Calendar,
    Shield,
    ShieldCheck,
    ShieldAlert,
    CreditCard,
    User,
    Hash,
    BadgeCheck,
    Copy,
    Check,
} from 'lucide-react';
import { Card, CardBody, Badge, SummaryCards } from '../../../components';
import type { SummaryCardItem } from '../../../components';
import dayjs from 'dayjs';

interface TenantDetailsTabProps {
    tenant: Tenant | null;
    loading: boolean;
}

type BadgeType = 'success' | 'danger' | 'warning' | 'neutral' | 'primary';

const STATUS_BADGE: Record<string, BadgeType> = {
    active: 'success',
    pending: 'warning',
    suspended: 'danger',
    cancelled: 'neutral',
};

const SUBSCRIPTION_BADGE: Record<string, BadgeType> = {
    ACTIVE: 'success',
    TRIAL: 'primary',
    SUSPENDED: 'warning',
    CANCELLED: 'danger',
};

const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
};

const CopyChip: FunctionComponent<{ value?: string | null }> = ({ value }) => {
    const [copied, setCopied] = useState(false);
    if (!value) return null;

    return (
        <button
            type="button"
            onClick={() => {
                navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center justify-center w-5 h-5 rounded text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors flex-shrink-0"
            aria-label="Copy to clipboard"
        >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
    );
};

const TenantInfoSkeleton: FunctionComponent = () => (
    <div className="p-4 md:p-6 animate-pulse space-y-6">
        <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                </div>
            </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[74px] bg-gray-100 dark:bg-gray-800 rounded-lg" />
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            ))}
        </div>
    </div>
);

const InfoRow: FunctionComponent<{
    icon: FunctionComponent<{ className?: string }>;
    label: string;
    value?: string | null;
    copyable?: boolean;
}> = ({ icon: Icon, label, value, copyable }) => (
    <div className="group flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
        <div className="w-9 h-9 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-sky-50 dark:group-hover:bg-sky-900/20">
            <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-colors group-hover:text-sky-500" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {value || '—'}
                </p>
                {copyable && <CopyChip value={value} />}
            </div>
        </div>
    </div>
);

const SectionCard: FunctionComponent<{
    title: string;
    icon: FunctionComponent<{ className?: string }>;
    children: ReactNode;
}> = ({ title, icon: Icon, children }) => (
    <Card>
        <CardBody>
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-sky-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            {children}
        </CardBody>
    </Card>
);

const TenantDetailsTab: FunctionComponent<TenantDetailsTabProps> = memo(({ tenant, loading }) => {
    if (loading) {
        return <TenantInfoSkeleton />;
    }

    if (!tenant) {
        return (
            <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No tenant information available</p>
            </div>
        );
    }

    const subscriptionStatusKey = String(tenant.subscriptionStatus || '').toUpperCase();
    const statusBadge = STATUS_BADGE[tenant.status] ?? 'neutral';
    const subscriptionBadge = SUBSCRIPTION_BADGE[subscriptionStatusKey] ?? 'neutral';

    const trialDaysLeft = subscriptionStatusKey === 'TRIAL' && tenant.trialEndsAt
        ? Math.max(0, dayjs(tenant.trialEndsAt).diff(dayjs(), 'day'))
        : null;

    const mraConfigured = tenant.isMraEnabled && tenant.mraApiConfigured;

    const statCards: SummaryCardItem[] = [
        {
            title: 'Subscription',
            value: tenant.subscriptionPlan || (subscriptionStatusKey.charAt(0) + subscriptionStatusKey.slice(1).toLowerCase()),
            subtitle: trialDaysLeft !== null ? `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left` : undefined,
            icon: <CreditCard className="w-5 h-5" />,
            bgColor: 'bg-sky-50 dark:bg-sky-900/20',
            iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
            textColor: 'text-sky-500 dark:text-sky-400',
        },
        {
            title: 'MRA Compliance',
            value: !tenant.isMraEnabled ? 'Not Enabled' : mraConfigured ? 'Configured' : 'Setup Pending',
            icon: mraConfigured ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />,
            bgColor: mraConfigured ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
            iconBgColor: mraConfigured ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-amber-100 dark:bg-amber-900/40',
            textColor: mraConfigured ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400',
        },
        {
            title: 'VAT Registered',
            value: tenant.isVatRegistered ? 'Yes' : 'No',
            icon: <BadgeCheck className="w-5 h-5" />,
            bgColor: 'bg-violet-50 dark:bg-violet-900/20',
            iconBgColor: 'bg-violet-100 dark:bg-violet-900/40',
            textColor: 'text-violet-500 dark:text-violet-400',
        },
        {
            title: 'Member Since',
            displayValue: tenant.registeredAt ? dayjs(tenant.registeredAt).format('MMM YYYY') : '—',
            value: tenant.registeredAt ? dayjs(tenant.registeredAt).format('MMM YYYY') : '—',
            icon: <Calendar className="w-5 h-5" />,
            bgColor: 'bg-gray-50 dark:bg-gray-800/50',
            iconBgColor: 'bg-gray-100 dark:bg-gray-700',
            textColor: 'text-gray-600 dark:text-gray-300',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 dark:from-sky-700 dark:to-sky-900 p-6">
                <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_top_right,white,transparent_55%)]" />
                <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 text-xl font-semibold text-white ring-2 ring-white/30">
                        {getInitials(tenant.businessName)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h2 className="text-xl font-semibold text-white truncate">
                                {tenant.businessName}
                            </h2>
                            <Badge type={statusBadge} className="!bg-white/15 !text-white">
                                {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                            </Badge>
                            <Badge type={subscriptionBadge} className="!bg-white/15 !text-white">
                                {subscriptionStatusKey.charAt(0) + subscriptionStatusKey.slice(1).toLowerCase()}
                            </Badge>
                        </div>
                        {tenant.tradingName && (
                            <p className="text-sm text-sky-100 mb-1">
                                Trading as: {tenant.tradingName}
                            </p>
                        )}
                        <div className="flex items-center gap-1.5 text-sm text-sky-100">
                            <span>Code: {tenant.tenantCode}</span>
                            <CopyChip value={tenant.tenantCode} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Key stats */}
            <SummaryCards cards={statCards} gridClassName="grid-cols-2 lg:grid-cols-4" />

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="Contact Information" icon={User}>
                    <InfoRow icon={User} label="Owner" value={tenant.ownerName} />
                    <InfoRow icon={Mail} label="Email" value={tenant.email} />
                    <InfoRow icon={Phone} label="Phone" value={tenant.phoneNumber} />
                    <InfoRow icon={Globe} label="Country" value={tenant.country} />
                    <InfoRow icon={MapPin} label="Address" value={tenant.address} />
                </SectionCard>

                <SectionCard title="Business & Compliance" icon={Building2}>
                    <InfoRow
                        icon={Building2}
                        label="Business Type"
                        value={tenant.businessType?.replace('_', ' ')}
                    />
                    <InfoRow icon={Hash} label="TIN" value={tenant.tin} copyable />
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
                    {tenant.activatedAt && (
                        <InfoRow
                            icon={Calendar}
                            label="Activated"
                            value={dayjs(tenant.activatedAt).format('DD MMM YYYY')}
                        />
                    )}
                </SectionCard>
            </div>
        </div>
    );
});

TenantDetailsTab.displayName = 'TenantDetailsTab';

export default TenantDetailsTab;
