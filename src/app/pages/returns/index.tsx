import { FunctionComponent } from 'react';
import { useIsNativeMobile } from '../../hooks/useMediaQuery';
import MobileReturns from './MobileReturns';
import DesktopReturns from './DesktopReturns';

const ReturnsPage: FunctionComponent = () => {
    const isNativeMobile = useIsNativeMobile();

    if (isNativeMobile) {
        return <MobileReturns />;
    }

    return <DesktopReturns />;
};

export default ReturnsPage;
