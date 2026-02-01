import { Wifi, Usb, Bluetooth, Cable, Printer, Check, Radar, RefreshCw, Layers } from 'lucide-react';
import { Button } from '../../../components';
import CustomModal from '../../../components/Modal';

type DiscoveryFilterType = 'ALL' | PrinterConnectionType;

const CONNECTION_OPTIONS: { value: DiscoveryFilterType; label: string; icon: React.ReactNode }[] = [
    { value: 'ALL', label: 'All', icon: <Layers className="w-4 h-4" /> },
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
}: DiscoveryModalProps) => (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Discover Printers" size="full" className="max-w-2xl">
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            {/* Connection Type Filter */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-gray-600">
                {CONNECTION_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onConnectionTypeChange(opt.value)}
                        disabled={isDiscovering}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50
                            ${selectedConnectionType === opt.value ? 'bg-sky-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                    >
                        {opt.icon}
                        {opt.label}
                    </button>
                ))}
                <button onClick={onRefresh} disabled={isDiscovering} className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50" title="Refresh">
                    <RefreshCw className={`w-4 h-4 ${isDiscovering ? 'animate-spin' : ''}`} />
                    {!isMobile && 'Refresh'}
                </button>
            </div>

            {/* Content */}
            {isDiscovering ? (
                <div className="text-center py-12">
                    <Radar className="w-12 h-12 text-sky-500 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Discovering {discoveryFilter === 'ALL' ? 'all' : discoveryFilter.toLowerCase()} printers...</p>
                </div>
            ) : discoveredPrinters.length === 0 ? (
                <div className="text-center py-8">
                    <Radar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No printers discovered.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Make sure printers are on and connected.</p>
                </div>
            ) : (
                <>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Found {discoveredPrinters.length} printer(s). Select one to add.</p>
                    <div className="max-h-80 overflow-y-auto space-y-2">
                        {discoveredPrinters.map((printer, i) => {
                            const isSelected = selectedPrinter?.name === printer.name && selectedPrinter?.address === printer.address;
                            return (
                                <div
                                    key={`${printer.name}-${i}`}
                                    onClick={() => onSelect(printer)}
                                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                                        ${isSelected ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 ring-2 ring-sky-500' : 'border-gray-200 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${printer.isOnline ? 'bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                            {getConnectionIcon(printer.connectionType)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{printer.name}</h3>
                                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {printer.address && <span>{printer.address}{printer.port ? `:${printer.port}` : ''}</span>}
                                                {printer.manufacturer && <span>• {printer.manufacturer}</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${printer.connectionType === 'USB' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'}`}>
                                                    {printer.connectionType}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${printer.isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                                    {printer.isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="w-6 h-6 text-sky-500" />}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Button onClick={onClose} layout="outline" theme="neutral">Cancel</Button>
                        <Button onClick={onSave} theme="primary" disabled={!selectedPrinter || isSaving}>{isSaving ? 'Saving...' : 'Add Printer'}</Button>
                    </div>
                </>
            )}
        </div>
    </CustomModal>
);

export type { DiscoveryFilterType };
