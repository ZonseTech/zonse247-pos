import { FunctionComponent } from 'react';
import { useIsNativeMobile } from '../../hooks/useMediaQuery';
import MobileUserManagement from './MobileUserManagement';
import DesktopUserManagement from './DesktopUserManagement';

const UserManagement: FunctionComponent = () => {
    const isNativeMobile = useIsNativeMobile();

    if (isNativeMobile) {
        return <MobileUserManagement />;
    }

    return <DesktopUserManagement />;
};

export default UserManagement;
