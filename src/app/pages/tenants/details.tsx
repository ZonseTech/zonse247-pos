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
    CreditCard,
    User as UserIcon
} from 'lucide-react';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { Badge, Box, Button, Flex, Grid, IconButton, Skeleton, Text, Tooltip } from '@radix-ui/themes';
import * as Tabs from '@radix-ui/react-tabs';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { FormFieldCard } from '../../components';
import { ROUTES } from '../../utils/constants';
import { useTenantDetails } from '../../hooks/useTenantDetails';
import { BranchesTab, UsersTab, TerminalsTab, SubscriptionsTab } from './partials/tabs';
import SubscribeBranchModal from './partials/SubscribeBranchModal';
import TenantFormModal from './partials/TenantFormModal';
import BranchFormModal from '../branch/partials/BranchFormModal';
import TerminalFormModal from '../terminal/partials/TerminalFormModal';

type TabId = 'branches' | 'users' | 'terminals' | 'subscriptions';

interface TabConfig {
    id: TabId;
    label: string;
    icon: typeof Building2;
    count: number;
}

const statusColorMap: Record<string, 'green' | 'amber' | 'red' | 'gray'> = {
    active: 'green',
    pending: 'amber',
    suspended: 'red',
    cancelled: 'gray',
};

const tabTriggerClass =
    'flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-medium transition-colors border-b-2 outline-none cursor-pointer ' +
    'text-gray-500 dark:text-gray-400 border-transparent ' +
    'hover:text-gray-700 dark:hover:text-gray-300 ' +
    'data-[state=active]:text-sky-500 dark:data-[state=active]:text-sky-400 ' +
    'data-[state=active]:border-sky-500 dark:data-[state=active]:border-sky-400';

const TenantInfoSkeleton: FunctionComponent = () => (
    <Flex align="start" gap="4">
        <Skeleton width="64px" height="64px" className="rounded-full flex-shrink-0" />
        <Flex direction="column" gap="2" flexGrow="1">
            <Skeleton width="200px" height="24px" />
            <Skeleton width="140px" height="16px" />
            <Flex gap="4" mt="2">
                <Skeleton width="160px" height="16px" />
                <Skeleton width="150px" height="16px" />
            </Flex>
        </Flex>
    </Flex>
);

const TenantDetails: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const tenantId = location.state?.tenantId as string | undefined;
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddBranchModal, setShowAddBranchModal] = useState(false);
    const [showAddTerminalModal, setShowAddTerminalModal] = useState(false);

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
        loadBranches,
        loadTerminals,
        loadSubscriptions,
    } = useTenantDetails(tenantId);

    const tabs: TabConfig[] = useMemo(() => [
        { id: 'branches', label: 'Branches', icon: Building2, count: branches.length },
        { id: 'users', label: 'Users', icon: Users, count: users.length },
        { id: 'terminals', label: 'Terminals', icon: Monitor, count: terminals.length },
        { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptions.length },
    ], [branches.length, users.length, terminals.length, subscriptions.length]);

    const handleTabChange = useCallback((tabId: TabId) => {
        setActiveTab(tabId);
    }, [setActiveTab]);

    const handleEdit = useCallback(() => {
        if (tenantId) {
            setShowEditModal(true);
        }
    }, [tenantId]);

    const handleBack = useCallback(() => {
        navigate(ROUTES.TENANTS);
    }, [navigate]);

    const handleCreate = useCallback(() => {
        if (!tenantId) return;

        switch (activeTab) {
            case 'branches':
                setShowAddBranchModal(true);
                break;
            case 'users':
                navigate(ROUTES.USER_FORM, { state: { tenantId } });
                break;
            case 'terminals':
                setShowAddTerminalModal(true);
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

    if (error && !loading.tenant) {
        return (
            <AppLayout>
                <Flex direction="column" align="center" justify="center" py="9">
                    <HiOutlineBuildingOffice2 className="w-16 h-16 text-red-400 mb-4" />
                    <Text as="p" size="5" weight="bold" mb="2">Error Loading Tenant</Text>
                    <Text as="p" color="gray" mb="6">{error}</Text>
                    <Flex gap="3">
                        <Button variant="soft" color="gray" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4" />
                            Back to Tenants
                        </Button>
                        <Button onClick={refreshAll}>
                            <RefreshCw className="w-4 h-4" />
                            Retry
                        </Button>
                    </Flex>
                </Flex>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <PageHeader
                title="Tenant Details"
                description="View tenant information, branches, users, and terminals"
                icon={<HiOutlineBuildingOffice2 className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                className='md:mb-0 pb-0'
                showBackButton
            />

            <Flex direction="column" gap="5">
                <FormFieldCard>
                    {loading.tenant ? (
                        <TenantInfoSkeleton />
                    ) : tenant ? (
                        <Flex direction="column" gap="4">
                            <Flex justify="between" align="start" gap="4">
                                <Flex direction={{ initial: 'column', sm: 'row' }} align={{ sm: 'center' }} gap="4">
                                    <Flex align="center" justify="center" className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex-shrink-0">
                                        <Building2 className="w-8 h-8 text-sky-500" />
                                    </Flex>
                                    <Box>
                                        <Flex align="center" gap="3" wrap="wrap" mb="1">
                                            <Text as="p" size="5" weight="bold">{tenant.businessName}</Text>
                                            <Badge variant="soft" radius="full" color={statusColorMap[tenant.status] || 'gray'}>
                                                {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                                            </Badge>
                                        </Flex>
                                        <Text as="p" size="2" color="gray">
                                            {tenant.tradingName ? `Trading as: ${tenant.tradingName} • ` : ''}
                                            Code: {tenant.tenantCode} {tenant.tin && `• TIN: ${tenant.tin}`}
                                        </Text>
                                    </Box>
                                </Flex>

                                <Tooltip content="Edit tenant">
                                    <IconButton
                                        variant="soft"
                                        color="gray"
                                        size="2"
                                        onClick={handleEdit}
                                        disabled={loading.tenant}
                                        className="flex-shrink-0"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </IconButton>
                                </Tooltip>
                            </Flex>

                            <Grid columns={{ initial: '1', sm: '2', md: '4' }} gap="4">
                                <Box>
                                    <Flex align="center" gap="1">
                                        <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                                        <Text size="1" color="gray">Owner</Text>
                                    </Flex>
                                    <Text as="p" size="2" weight="medium" mt="1">{tenant.ownerName}</Text>
                                </Box>
                                <Box>
                                    <Flex align="center" gap="1">
                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                        <Text size="1" color="gray">Email</Text>
                                    </Flex>
                                    <Text as="p" size="2" weight="medium" mt="1">{tenant.email}</Text>
                                </Box>
                                <Box>
                                    <Flex align="center" gap="1">
                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                        <Text size="1" color="gray">Phone</Text>
                                    </Flex>
                                    <Text as="p" size="2" weight="medium" mt="1">{tenant.phoneNumber}</Text>
                                </Box>
                                {tenant.country && (
                                    <Box>
                                        <Flex align="center" gap="1">
                                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                                            <Text size="1" color="gray">Country</Text>
                                        </Flex>
                                        <Text as="p" size="2" weight="medium" mt="1">{tenant.country}</Text>
                                    </Box>
                                )}
                            </Grid>
                        </Flex>
                    ) : null}
                </FormFieldCard>

                <Box className="rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Tabs.Root value={activeTab} onValueChange={(val) => handleTabChange(val as TabId)}>
                        <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <Tabs.Trigger key={tab.id} value={tab.id} className={tabTriggerClass}>
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                        <Badge variant="soft" radius="full" color={isActive ? 'sky' : 'gray'}>
                                            {tab.count}
                                        </Badge>
                                    </Tabs.Trigger>
                                );
                            })}
                        </Tabs.List>

                        <Flex
                            align="center"
                            justify="between"
                            px="4"
                            py="3"
                            className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        >
                            <Text size="3" weight="medium">{tabs.find(t => t.id === activeTab)?.label}</Text>
                            <Flex align="center" gap="2">
                                <Button
                                    variant="soft"
                                    color="gray"
                                    size="2"
                                    onClick={refreshCurrentTab}
                                    disabled={loading[activeTab]}
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading[activeTab] ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                {tenantId && (
                                    <Button size="2" onClick={handleCreate}>
                                        <Plus className="w-4 h-4" />
                                        {getCreateButtonLabel()}
                                    </Button>
                                )}
                            </Flex>
                        </Flex>

                        <Tabs.Content value="branches">
                            <BranchesTab
                                branches={branches}
                                loading={loading.branches}
                                tenantId={tenantId}
                            />
                        </Tabs.Content>
                        <Tabs.Content value="users">
                            <UsersTab
                                users={users}
                                loading={loading.users}
                                tenantId={tenantId}
                            />
                        </Tabs.Content>
                        <Tabs.Content value="terminals">
                            <TerminalsTab
                                terminals={terminals}
                                branches={branches}
                                loading={loading.terminals}
                                tenantId={tenantId}
                                onRefresh={loadTerminals}
                            />
                        </Tabs.Content>
                        <Tabs.Content value="subscriptions">
                            <SubscriptionsTab
                                subscriptions={subscriptions}
                                loading={loading.subscriptions}
                                tenantId={tenantId}
                                onRefresh={loadSubscriptions}
                                onSubscribe={() => setShowSubscribeModal(true)}
                            />
                        </Tabs.Content>
                    </Tabs.Root>
                </Box>
            </Flex>

            {tenantId && (
                <SubscribeBranchModal
                    isOpen={showSubscribeModal}
                    onClose={() => setShowSubscribeModal(false)}
                    tenantId={tenantId}
                    onSuccess={loadSubscriptions}
                />
            )}

            {showEditModal && tenantId && (
                <TenantFormModal
                    tenantId={tenantId}
                    onClose={() => setShowEditModal(false)}
                    onSaved={refreshAll}
                />
            )}

            {showAddBranchModal && tenantId && (
                <BranchFormModal
                    tenantId={tenantId}
                    onClose={() => setShowAddBranchModal(false)}
                    onSaved={loadBranches}
                />
            )}

            {showAddTerminalModal && tenantId && (
                <TerminalFormModal
                    tenantId={tenantId}
                    onClose={() => setShowAddTerminalModal(false)}
                    onSaved={loadTerminals}
                />
            )}
        </AppLayout>
    );
};

export default TenantDetails;
