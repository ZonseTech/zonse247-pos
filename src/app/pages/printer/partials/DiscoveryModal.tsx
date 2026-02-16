import { Wifi, Usb, Bluetooth, Cable, Printer, Check, Radar, RefreshCw, X } from 'lucide-react';
import { Button } from '../../../components';
import MobilePageHeader from '../../../components/page/MobilePageHeader';

type DiscoveryFilterType = PrinterConnectionType;

const CONNECTION_OPTIONS: { value: DiscoveryFilterType; label: string; icon: React.ReactNode }[] = [
    { value: 'USB', label: 'USB', icon: <Usb className="w-4 h-4" /> },
    { value: 'NETWORK', label: 'Network', icon: <Wifi className="w-4 h-4" /> },
    { value: 'SERIAL', label: 'Serial', icon: <Cable className="w-4 h-4" /> },
    { value: 'BLUETOOTH', label: 'Bluetooth', icon: <Bluetooth className="w-4 h-4" /> },
];

const getConnectionIcon = (type: PrinterConnectionType) => {
    const icons: Record<string, React.ReactNode> = {
        NETWORK: <Wifi className="w-5 h-5" />,
        WIFI: <Wifi className="w-5 h-5" />,
        USB: <Usb className="w-5 h-5" />,
        BLUETOOTH: <Bluetooth className="w-5 h-5" />,
        SERIAL: <Cable className="w-5 h-5" />,
    };
    return icons[type] || <Printer className="w-5 h-5" />;
};

interface DiscoveryModalProps {
    isOpen: boolean;
    isDiscovering: boolean;
    selectedConnectionType: DiscoveryFilterType;
    discoveryFilter: DiscoveryFilterType;
    discoveredPrinters: DiscoveredPrinter[];
    selectedPrinter: DiscoveredPrinter | null;
    isSaving: boolean;
    isMobile: boolean;
    onClose: () => void;
    onConnectionTypeChange: (type: DiscoveryFilterType) => void;
    onRefresh: () => void;
    onSelect: (printer: DiscoveredPrinter) => void;
    onSave: () => void;
}

export const DiscoveryModal = ({
    isOpen, isDiscovering, selectedConnectionType, discoveryFilter,
    discoveredPrinters, selectedPrinter, isSaving, isMobile,
    onClose, onConnectionTypeChange, onRefresh, onSelect, onSave
}: DiscoveryModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 safe-area-top-android">
                <MobilePageHeader
                    title="Discover Printers"
                    onLeftPress={onClose}
                    rightContent={
                        <button
                            onClick={onRefresh}
                            disabled={isDiscovering}
                            className="p-2 -mr-2 text-sky-500 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${isDiscovering ? 'animate-spin' : ''}`} />
                        </button>
                    }
                />
            </div>

            {/* Connection Type Filter */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {CONNECTION_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onConnectionTypeChange(opt.value)}
                            disabled={isDiscovering}
                            className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border-2 disabled:opacity-50
                                ${selectedConnectionType === opt.value
                                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        >
                            {opt.icon}
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-32">
                {isDiscovering ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <Radar className="w-16 h-16 text-sky-500 animate-pulse" />
                            <div className="absolute inset-0 w-16 h-16 border-4 border-sky-500/30 rounded-full animate-ping" />
                        </div>
                        <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">
                            Discovering {discoveryFilter.toLowerCase()} printers...
                        </p>
                        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                            This may take a few seconds
                        </p>
                    </div>
                ) : discoveredPrinters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
                            <Radar className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
                            No printers discovered
                        </p>
                        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500 text-center px-8">
                            Make sure your printers are turned on and connected to the same network
                        </p>
                        <Button
                            onClick={onRefresh}
                            theme="primary"
                            layout="outline"
                            className="mt-6"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Found {discoveredPrinters.length} printer(s). Select one to add.
                        </p>
                        {discoveredPrinters.map((printer, i) => {
                            const isSelected = selectedPrinter?.name === printer.name && selectedPrinter?.address === printer.address;
                            return (
                                <div
                                    key={`${printer.name}-${i}`}
                                    onClick={() => onSelect(printer)}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                                        ${isSelected
                                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 active:bg-gray-50 dark:active:bg-gray-700'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${printer.isOnline
                                                ? 'bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                            {getConnectionIcon(printer.connectionType)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {printer.name}
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                {printer.address && (
                                                    <span className="truncate max-w-[150px]">
                                                        {printer.address}{printer.port ? `:${printer.port}` : ''}
                                                    </span>
                                                )}
                                                {printer.manufacturer && (
                                                    <span className="truncate">• {printer.manufacturer}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${printer.connectionType === 'USB'
                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                        : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                                                    }`}>
                                                    {printer.connectionType}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${printer.isOnline
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                    {printer.isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="flex-shrink-0 ml-3">
                                            <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Fixed Bottom Action Buttons */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 safe-area-bottom">
                <div className="flex gap-3">
                    <Button
                        onClick={onClose}
                        layout="outline"
                        theme="neutral"
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onSave}
                        theme="primary"
                        disabled={!selectedPrinter || isSaving}
                        className="flex-1"
                    >
                        {isSaving ? 'Adding...' : 'Add Printer'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export type { DiscoveryFilterType };
