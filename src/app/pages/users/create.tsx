import { FunctionComponent } from 'react';
import { useIsNativeMobile } from '../../hooks/useMediaQuery';
import MobileUserForm from './forms/MobileUserForm';
import DesktopUserForm from './forms/DesktopUserForm';
import { OfflinePlaceholder } from '../../components';
import { useConnectivity } from '../../hooks/useConnectivity';
import AppLayout from '../../layouts/AppLayout';
import { Box } from '@radix-ui/themes';

const UserForm: FunctionComponent = () => {
    const isNativeMobile = useIsNativeMobile();
    const { isOnline } = useConnectivity();

    if (!isOnline) {
        return (
            <AppLayout>
                <Box className="max-w-6xl mx-auto" px={{ initial: "4", sm: "6", lg: "8" }} py="6">
                    <OfflinePlaceholder
                        title="Staff Management Unavailable Offline"
                        description="Creating or editing staff members requires an internet connection to sync with the server. Please connect to the internet and try again."
                        variant="cloud"
                    />
                </Box>
            </AppLayout>
        );
    }

    if (isNativeMobile) {
        return <MobileUserForm />;
    }

    return <DesktopUserForm />;
};

export default UserForm;
