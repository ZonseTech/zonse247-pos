import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Notify } from 'notiflix';
import { useAuth } from '../../../context/AuthProvider';
import branchService from '../../../services/branch.service';
import AccountBranchesTab from '../tabs/AccountBranchesTab';

const BranchesPage: FunctionComponent = () => {
    const { user } = useAuth();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!user?.tenantId) return;
        try {
            setLoading(true);
            const data = await branchService.list({ tenantId: user.tenantId });
            setBranches(data);
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

    return <AccountBranchesTab branches={branches} loading={loading} onRefresh={load} />;
};

export default BranchesPage;
