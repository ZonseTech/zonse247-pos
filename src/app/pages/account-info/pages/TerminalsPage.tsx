import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Notify } from 'notiflix';
import { useAuth } from '../../../context/AuthProvider';
import terminalService from '../../../services/terminal.service';
import branchService from '../../../services/branch.service';
import AccountTerminalsTab from '../tabs/AccountTerminalsTab';

const TerminalsPage: FunctionComponent = () => {
    const { user } = useAuth();
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!user?.tenantId) return;
        try {
            setLoading(true);
            const [terminalsData, branchesData] = await Promise.all([
                terminalService.list({ tenantId: user.tenantId }),
                branchService.list({ tenantId: user.tenantId }),
            ]);
            setTerminals(terminalsData);
            setBranches(branchesData);
        } catch (err) {
            console.error('Error loading terminals:', err);
            Notify.failure('Failed to load terminals');
        } finally {
            setLoading(false);
        }
    }, [user?.tenantId]);

    useEffect(() => {
        load();
    }, [load]);

    return <AccountTerminalsTab terminals={terminals} branches={branches} loading={loading} onRefresh={load} />;
};

export default TerminalsPage;
