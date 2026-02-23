import { FunctionComponent } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import MobilePrinterManagement from './MobilePrinterManagement';
import DesktopPrinterManagement from './DesktopPrinterManagement';

const PrinterManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <MobilePrinterManagement />;
    }

    return <DesktopPrinterManagement />;
};

export default PrinterManagement;
