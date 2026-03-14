import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import tenantService from '../services/tenant.service';
import branchService from '../services/branch.service';
import usersService from '../services/users.service';
import terminalService from '../services/terminal.service';
import subscriptionService from '../services/subscriptions.service';

interface TenantDetailsState {
    tenant: Tenant | null;
    branches: Branch[];
    users: User[];
    terminals: Terminal[];
    subscriptions: BranchSubscription[];
}

interface LoadingState {
    tenant: boolean;
    branches: boolean;
    users: boolean;
    terminals: boolean;
    subscriptions: boolean;
}

export const useTenantDetails = (tenantId: string | undefined) => {
    const [data, setData] = useState<TenantDetailsState>({
        tenant: null,
        branches: [],
        users: [],
        terminals: [],
        subscriptions: [],
    });

    const [loading, setLoading] = useState<LoadingState>({
        tenant: true,
        branches: false,
        users: false,
        terminals: false,
        subscriptions: false,
    });

    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'branches' | 'users' | 'terminals' | 'subscriptions'>('branches');

    useEffect(() => {
        if (tenantId) {
            loadTenant();
        } else {
            setLoading(prev => ({ ...prev, tenant: false }));
            loadBranches();
        }
    }, [tenantId]);

    useEffect(() => {
        switch (activeTab) {
            case 'branches':
                if (data.branches.length === 0 && !loading.branches) {
                    loadBranches();
                }
                break;
            case 'users':
                if (data.users.length === 0 && !loading.users) {
                    loadUsers();
                }
                break;
            case 'terminals':
                if (data.terminals.length === 0 && !loading.terminals) {
                    loadTerminals();
                }
                break;
            case 'subscriptions':
                if (data.subscriptions.length === 0 && !loading.subscriptions) {
                    loadSubscriptions();
                }
                break;
        }
    }, [activeTab]);

    const loadTenant = async () => {
        if (!tenantId) return;

        try {
            setLoading(prev => ({ ...prev, tenant: true }));
            setError(null);
            const tenant = await tenantService.show(tenantId);
            setData(prev => ({ ...prev, tenant }));
            loadBranches();
        } catch (err) {
            console.error('Error loading tenant:', err);
            setError('Failed to load tenant details');
            Notify.failure('Failed to load tenant details');
        } finally {
            setLoading(prev => ({ ...prev, tenant: false }));
        }
    };

    const loadBranches = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, branches: true }));
            const branches = await branchService.list({ isAdminMode: true, ...(tenantId && { tenantId }) });
            setData(prev => ({ ...prev, branches }));
        } catch (err) {
            console.error('Error loading branches:', err);
            Notify.failure('Failed to load branches');
        } finally {
            setLoading(prev => ({ ...prev, branches: false }));
        }
    }, [tenantId]);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, users: true }));
            const users = await usersService.list({ isAdminMode: true, ...(tenantId && { tenantId }) });
            setData(prev => ({ ...prev, users }));
        } catch (err) {
            console.error('Error loading users:', err);
            Notify.failure('Failed to load users');
        } finally {
            setLoading(prev => ({ ...prev, users: false }));
        }
    }, [tenantId]);

    const loadTerminals = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, terminals: true }));
            const terminals = await terminalService.list({ isAdminMode: true, ...(tenantId && { tenantId }) });
            setData(prev => ({ ...prev, terminals }));
        } catch (err) {
            console.error('Error loading terminals:', err);
            Notify.failure('Failed to load terminals');
        } finally {
            setLoading(prev => ({ ...prev, terminals: false }));
        }
    }, [tenantId]);

    const loadSubscriptions = useCallback(async () => {
        if (!tenantId) return;
        try {
            setLoading(prev => ({ ...prev, subscriptions: true }));
            const subscriptions = await subscriptionService.getByTenantId(tenantId);
            setData(prev => ({ ...prev, subscriptions }));
        } catch (err) {
            console.error('Error loading subscriptions:', err);
            Notify.failure('Failed to load subscriptions');
        } finally {
            setLoading(prev => ({ ...prev, subscriptions: false }));
        }
    }, [tenantId]);

    const refreshCurrentTab = useCallback(() => {
        switch (activeTab) {
            case 'branches':
                loadBranches();
                break;
            case 'users':
                loadUsers();
                break;
            case 'terminals':
                loadTerminals();
                break;
            case 'subscriptions':
                loadSubscriptions();
                break;
        }
    }, [activeTab, loadBranches, loadUsers, loadTerminals, loadSubscriptions]);

    const refreshAll = useCallback(() => {
        if (tenantId) {
            loadTenant();
        }
        setData(prev => ({ ...prev, branches: [], users: [], terminals: [], subscriptions: [] }));
        loadBranches();
    }, [tenantId, loadBranches]);

    return {
        ...data,
        loading,
        error,
        activeTab,
        setActiveTab,
        refreshCurrentTab,
        refreshAll,
        loadBranches,
        loadUsers,
        loadTerminals,
        loadSubscriptions,
    };
};
