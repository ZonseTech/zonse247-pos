import { FunctionComponent } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import MobileMyProfile from './MobileMyProfile';
import DesktopMyProfile from './DesktopMyProfile';

const MyProfilePage: FunctionComponent = () => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <MobileMyProfile />;
    }

    return <DesktopMyProfile />;
};

export default MyProfilePage;