import MobilePOS from './MobilePOS';
import DesktopPOS from './DesktopPOS';
import { FunctionComponent } from 'react';
import { useIsNativeMobile } from '../../hooks/useMediaQuery';

const POSSystem: FunctionComponent = () => {
    const isNativeMobile = useIsNativeMobile();

    return isNativeMobile ? <MobilePOS /> : <DesktopPOS />;
};

export default POSSystem;