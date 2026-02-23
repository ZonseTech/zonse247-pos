import { FunctionComponent, ReactNode } from 'react';
import {
    Wifi,
    Usb,
    Bluetooth,
    Network,
    Star
} from 'lucide-react';

interface PrinterMobileCardProps {
    printer: Printer;
    onEdit: (printer: Printer) => void;
}

const PrinterMobileCard: FunctionComponent<PrinterMobileCardProps> = ({
    printer,
    onEdit
}) => {
    const getConnectionIcon = (type: PrinterConnectionType) => {
        const icons: Record<PrinterConnectionType, ReactNode> = {
            'USB': <Usb className="w-5 h-5" />,
            'NETWORK': <Network className="w-5 h-5" />,
            'BLUETOOTH': <Bluetooth className="w-5 h-5" />,
            'SERIAL': <Network className="w-5 h-5" />,
            'WIFI': <Wifi className="w-5 h-5" />
        };
        return icons[type] || <Network className="w-5 h-5" />;
    };

    const getConnectionLabel = (type: PrinterConnectionType) => {
        const labels: Record<PrinterConnectionType, string> = {
            'USB': 'USB',
            'NETWORK': 'Network',
            'BLUETOOTH': 'Bluetooth',
            'SERIAL': 'Serial',
            'WIFI': 'WiFi'
        };
        return labels[type] || type;
    };

    const getPrinterTypeLabel = (type: PrinterType) => {
        const labels: Record<PrinterType, string> = {
            'THERMAL': 'Thermal',
            'INKJET': 'Inkjet',
            'LASER': 'Laser',
            'DOT_MATRIX': 'Dot Matrix',
            'LABEL': 'Label'
        };
        return labels[type] || type;
    };

    return (
        <div
            onClick={() => onEdit(printer)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-none active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors cursor-pointer"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${printer.isActive ? 'bg-sky-100 dark:bg-sky-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <span className={printer.isActive ? 'text-sky-500 dark:text-sky-400' : 'text-gray-400'}>
                            {getConnectionIcon(printer.connectionType)}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                            {printer.printerName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getConnectionLabel(printer.connectionType)}
                            {printer.printerModel && ` • ${printer.printerModel}`}
                            {` • ${getPrinterTypeLabel(printer.printerType)}`}
                        </p>
                    </div>
                </div>
                {printer.isDefault && (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                )}
            </div>
        </div>
    );
};

export default PrinterMobileCard;
