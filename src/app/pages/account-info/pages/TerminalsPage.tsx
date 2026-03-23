import { FunctionComponent, useEffect, useState } from 'react';
import { Notify } from 'notiflix';
import { useAuth } from '../../../context/AuthProvider';
import terminalService from '../../../services/terminal.service';
import AccountTerminalsTab from '../tabs/AccountTerminalsTab';

const TerminalsPage: FunctionComponent = () => {
    const { user } = useAuth();
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!user?.tenantId) return;
            try {
                setLoading(true);
                const data = await terminalService.list({ tenantId: user.tenantId });
                setTerminals(data);
            } catch (err) {
                console.error('Error loading terminals:', err);
                Notify.failure('Failed to load terminals');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.tenantId]);

    return <AccountTerminalsTab terminals={terminals} loading={loading} />;
};

export default TerminalsPage;
