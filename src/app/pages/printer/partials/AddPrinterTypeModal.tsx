import { FunctionComponent } from 'react';
import { Usb, Wifi, Bluetooth, Network, Cable, ChevronRight } from 'lucide-react';
import { BottomSheet } from '../../../components';

interface ConnectionOption {
    type: PrinterConnectionType;
    label: string;
    description: string;
    icon: React.ReactNode;
}

const CONNECTION_OPTIONS: ConnectionOption[] = [
    {
        type: 'USB',
        label: 'USB Printer',
        description: 'Connect via USB cable',
        icon: <Usb className="w-6 h-6" />
    },
    {
        type: 'NETWORK',
        label: 'Network Printer',
        description: 'Connect via Ethernet/LAN',
        icon: <Network className="w-6 h-6" />
    },
    {
        type: 'WIFI',
        label: 'WiFi Printer',
        description: 'Connect wirelessly via WiFi',
        icon: <Wifi className="w-6 h-6" />
    },
    {
        type: 'BLUETOOTH',
        label: 'Bluetooth Printer',
        description: 'Connect via Bluetooth',
        icon: <Bluetooth className="w-6 h-6" />
    },
    {
        type: 'SERIAL',
        label: 'Serial Printer',
        description: 'Connect via serial port',
        icon: <Cable className="w-6 h-6" />
    }
];

interface AddPrinterTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: PrinterConnectionType) => void;
}

const AddPrinterTypeModal: FunctionComponent<AddPrinterTypeModalProps> = ({
    isOpen,
    onClose,
    onSelect
}) => {
    const handleSelect = (type: PrinterConnectionType) => {
        onSelect(type);
        onClose();
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="Select Printer Type">
            <div className="space-y-2">
                {CONNECTION_OPTIONS.map((option) => (
                    <button
                        key={option.type}
                        onClick={() => handleSelect(option.type)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                            hover:border-sky-300 dark:hover:border-sky-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                            transition-all active:scale-[0.98]"
                    >
                        <div className="p-2.5 text-gray-600 dark:text-gray-400">
                            {option.icon}
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                {option.label}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {option.description}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                ))}
            </div>
        </BottomSheet>
    );
};

export default AddPrinterTypeModal;
