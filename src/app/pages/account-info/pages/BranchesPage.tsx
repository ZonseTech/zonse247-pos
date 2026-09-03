import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Notify } from 'notiflix';
import { useAuth } from '../../../context/AuthProvider';
import branchService from '../../../services/branch.service';
import subscriptionService from '../../../services/subscriptions.service';
import AccountBranchesTab from '../tabs/AccountBranchesTab';

const BranchesPage: FunctionComponent = () => {
    const { user } = useAuth();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [subscriptions, setSubscriptions] = useState<BranchSubscription[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!user?.tenantId) return;
        try {
            setLoading(true);
            const [branchesData, subscriptionsData] = await Promise.all([
                branchService.list({ tenantId: user.tenantId }),
                subscriptionService.getByTenantId(user.tenantId),
            ]);
            setBranches(branchesData);
            setSubscriptions(subscriptionsData);
        } catch (err) {
            console.error('Error loading branches:', err);
            Notify.failure('Failed to load branches');
        } finally {
            setLoading(false);
        }
    }, [user?.tenantId]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <AccountBranchesTab
            branches={branches}
            subscriptions={subscriptions}
            loading={loading}
            onRefresh={load}
        />
    );
};

export default BranchesPage;
