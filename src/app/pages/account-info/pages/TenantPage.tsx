import { FunctionComponent, useEffect, useState } from 'react';
import { Notify } from 'notiflix';
import { useAuth } from '../../../context/AuthProvider';
import tenantService from '../../../services/tenant.service';
import TenantDetailsTab from '../tabs/TenantDetailsTab';

const TenantPage: FunctionComponent = () => {
    const { user } = useAuth();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!user?.tenantId) return;
            try {
                setLoading(true);
                const data = await tenantService.show(user.tenantId);
                setTenant(data);
            } catch (err) {
                console.error('Error loading tenant:', err);
                Notify.failure('Failed to load tenant details');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.tenantId]);

    return <TenantDetailsTab tenant={tenant} loading={loading} />;
};

export default TenantPage;
