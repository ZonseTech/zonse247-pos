import { FunctionComponent, ReactNode } from 'react';
import { Card, Flex, Text } from '@radix-ui/themes';
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
        <Card
            size="2"
            className="cursor-pointer active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
            onClick={() => onEdit(printer)}
        >
            <Flex align="center" justify="between">
                <Flex align="center" gap="3">
                    <Flex
                        align="center"
                        justify="center"
                        className={`p-2 rounded-lg ${printer.isActive ? 'bg-sky-100 dark:bg-sky-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}
                    >
                        <span className={printer.isActive ? 'text-sky-500 dark:text-sky-400' : 'text-gray-400'}>
                            {getConnectionIcon(printer.connectionType)}
                        </span>
                    </Flex>
                    <Flex direction="column" gap="1">
                        <Text size="2" weight="medium">
                            {printer.printerName}
                        </Text>
                        <Text size="1" color="gray">
                            {getConnectionLabel(printer.connectionType)}
                            {printer.printerModel && ` • ${printer.printerModel}`}
                            {` • ${getPrinterTypeLabel(printer.printerType)}`}
                        </Text>
                    </Flex>
                </Flex>
                {printer.isDefault && (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                )}
            </Flex>
        </Card>
    );
};

export default PrinterMobileCard;
