import { FunctionComponent } from 'react';
import { useIsNativeMobile } from '../../hooks/useMediaQuery';
import MobilePOS from './MobilePOS';
import DesktopPOS from './DesktopPOS';

const POSSystem: FunctionComponent = () => {
    const isNativeMobile = useIsNativeMobile();

    if (isNativeMobile) {
        return <MobilePOS />;
    }

    return <DesktopPOS />;
};

export default POSSystem;