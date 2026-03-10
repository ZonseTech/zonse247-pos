import { FunctionComponent } from 'react';
import { useIsNativeMobile } from '../../hooks/useMediaQuery';
import MobileUserForm from './forms/MobileUserForm';
import DesktopUserForm from './forms/DesktopUserForm';
import { OfflinePlaceholder } from '../../components';
import { useConnectivity } from '../../hooks/useConnectivity';
import AppLayout from '../../layouts/AppLayout';

const UserForm: FunctionComponent = () => {
    const isNativeMobile = useIsNativeMobile();
    const { isOnline } = useConnectivity();

    if (!isOnline) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <OfflinePlaceholder
                        title="Staff Management Unavailable Offline"
                        description="Creating or editing staff members requires an internet connection to sync with the server. Please connect to the internet and try again."
                        variant="cloud"
                    />
                </div>
            </AppLayout>
        );
    }

    if (isNativeMobile) {
        return <MobileUserForm />;
    }

    return <DesktopUserForm />;
};

export default UserForm;
