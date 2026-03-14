import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
    Building2,
    Users,
    Monitor,
    Mail,
    Phone,
    Globe,
    ArrowLeft,
    RefreshCw,
    Edit2,
    Plus,
    CreditCard
} from 'lucide-react';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, Card, CardBody } from '../../components';
import { ROUTES } from '../../utils/constants';
import { useTenantDetails } from '../../hooks/useTenantDetails';
import { getStatusColor } from '../../utils/tenant-status';
import { BranchesTab, UsersTab, TerminalsTab, SubscriptionsTab } from './partials/tabs';
import SubscribeBranchModal from './partials/SubscribeBranchModal';

interface TabConfig {
    id: 'branches' | 'users' | 'terminals' | 'subscriptions';
    label: string;
    icon: typeof Building2;
    count: number;
}

const TenantInfoSkeleton: FunctionComponent = () => (
    <div className="animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                <div className="flex gap-4 mt-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36" />
                </div>
            </div>
        </div>
    </div>
);

const TenantDetails: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const tenantId = location.state?.tenantId as string | undefined;
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);

    const {
        tenant,
        branches,
        users,
        terminals,
        subscriptions,
        loading,
        error,
        activeTab,
        setActiveTab,
        refreshCurrentTab,
        refreshAll,
        loadTerminals,
        loadSubscriptions,
    } = useTenantDetails(tenantId);

    const tabs: TabConfig[] = useMemo(() => [
        { id: 'branches', label: 'Branches', icon: Building2, count: branches.length },
        { id: 'users', label: 'Users', icon: Users, count: users.length },
        { id: 'terminals', label: 'Terminals', icon: Monitor, count: terminals.length },
        { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptions.length },
    ], [branches.length, users.length, terminals.length, subscriptions.length]);

    const handleTabChange = useCallback((tabId: 'branches' | 'users' | 'terminals' | 'subscriptions') => {
        setActiveTab(tabId);
    }, [setActiveTab]);

    const handleEdit = useCallback(() => {
        if (tenantId) {
            navigate(ROUTES.TENANT_FORM, { state: { tenantId } });
        }
    }, [navigate, tenantId]);

    const handleBack = useCallback(() => {
        navigate(ROUTES.TENANTS);
    }, [navigate]);

    const handleCreate = useCallback(() => {
        if (!tenantId) return;

        switch (activeTab) {
            case 'branches':
                navigate(ROUTES.BRANCH_FORM, { state: { tenantId } });
                break;
            case 'users':
                navigate(ROUTES.USER_FORM, { state: { tenantId } });
                break;
            case 'terminals':
                navigate(ROUTES.TERMINAL_FORM, { state: { tenantId } });
                break;
            case 'subscriptions':
                setShowSubscribeModal(true);
                break;
        }
    }, [navigate, tenantId, activeTab]);

    const getCreateButtonLabel = () => {
        switch (activeTab) {
            case 'branches': return 'Add Branch';
            case 'users': return 'Add User';
            case 'terminals': return 'Add Terminal';
            case 'subscriptions': return 'Subscribe Branch';
        }
    };

    const isViewingAll = !tenantId;

    if (error && !loading.tenant && !isViewingAll) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center py-20">
                    <HiOutlineBuildingOffice2 className="w-16 h-16 text-red-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Error Loading Tenant
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                    <div className="flex gap-3">
                        <Button layout="outline" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Tenants
                        </Button>
                        <Button theme="primary" onClick={refreshAll}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <PageHeader
                title={isViewingAll ? "All Tenants Overview" : "Tenant Details"}
                description={isViewingAll
                    ? "View all branches, users, and terminals across all tenants"
                    : "View tenant information, branches, users, and terminals"
                }
                icon={<HiOutlineBuildingOffice2 className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                action={
                    <div className="flex items-center space-x-3">
                        <Button layout="outline" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <Button layout="outline" onClick={refreshAll} disabled={loading.tenant || loading.branches}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${(loading.tenant || loading.branches) ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {!isViewingAll && (
                            <Button theme="primary" onClick={handleEdit} disabled={loading.tenant}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Tenant
                            </Button>
                        )}
                    </div>
                }
                className='md:mb-0 pb-0'
            />

            {!isViewingAll && (
                <Card className="mb-6">
                    <CardBody>
                        {loading.tenant ? (
                            <TenantInfoSkeleton />
                        ) : tenant ? (
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
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        {tenant.tradingName ? `Trading as: ${tenant.tradingName} • ` : ''}
                                        Code: {tenant.tenantCode} {tenant.tin && `• TIN: ${tenant.tin}`}
                                    </p>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                            <Users className="w-4 h-4 mr-2" />
                                            <span className="font-medium">{tenant.ownerName}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                            <Mail className="w-4 h-4 mr-2" />
                                            <span>{tenant.email}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                            <Phone className="w-4 h-4 mr-2" />
                                            <span>{tenant.phoneNumber}</span>
                                        </div>
                                        {tenant.country && (
                                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                <Globe className="w-4 h-4 mr-2" />
                                                <span>{tenant.country}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </CardBody>
                </Card>
            )}

            {isViewingAll && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardBody className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-sky-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {loading.branches ? '...' : branches.length}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Branches</p>
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {loading.users ? '...' : users.length}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                <Monitor className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {loading.terminals ? '...' : terminals.length}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Terminals</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`
                                        group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-sm font-medium text-center 
                                        hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:z-10 focus:outline-none
                                        transition-colors duration-200
                                        ${isActive
                                        ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }
                                    `}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-sky-500' : 'text-gray-400'}`} />
                                    <span>{tab.label}</span>
                                    <span className={`
                                            inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium
                                            ${isActive
                                            ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }
                                        `}>
                                        {tab.count}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {tabs.find(t => t.id === activeTab)?.label}
                    </h3>
                    <div className="flex items-center gap-2">
                        <Button
                            layout="outline"
                            size="small"
                            onClick={refreshCurrentTab}
                            disabled={loading[activeTab]}
                        >
                            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading[activeTab] ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {tenantId && (
                            <Button
                                theme="primary"
                                size="small"
                                onClick={handleCreate}
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                {getCreateButtonLabel()}
                            </Button>
                        )}
                    </div>
                </div>
                <div className="p-0">
                    {activeTab === 'branches' && (
                        <BranchesTab
                            branches={branches}
                            loading={loading.branches}
                            tenantId={tenantId}
                        />
                    )}
                    {activeTab === 'users' && (
                        <UsersTab
                            users={users}
                            loading={loading.users}
                            tenantId={tenantId}
                        />
                    )}
                    {activeTab === 'terminals' && (
                        <TerminalsTab
                            terminals={terminals}
                            loading={loading.terminals}
                            tenantId={tenantId}
                            onRefresh={loadTerminals}
                        />
                    )}
                    {activeTab === 'subscriptions' && (
                        <SubscriptionsTab
                            subscriptions={subscriptions}
                            loading={loading.subscriptions}
                            tenantId={tenantId}
                            onRefresh={loadSubscriptions}
                            onSubscribe={() => setShowSubscribeModal(true)}
                        />
                    )}
                </div>
            </div>

            {tenantId && (
                <SubscribeBranchModal
                    isOpen={showSubscribeModal}
                    onClose={() => setShowSubscribeModal(false)}
                    tenantId={tenantId}
                    onSuccess={loadSubscriptions}
                />
            )}
        </AppLayout>
    );
};

export default TenantDetails;
