import { FunctionComponent } from 'react';
import { useIsNativeMobile } from '../../hooks/useMediaQuery';
import MobileUserForm from './forms/MobileUserForm';
import DesktopUserForm from './forms/DesktopUserForm';

const UserForm: FunctionComponent = () => {
    const isNativeMobile = useIsNativeMobile();

    if (isNativeMobile) {
        return <MobileUserForm />;
    }

    return <DesktopUserForm />;
};

export default UserForm;
