import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Badge, Flex, ScrollArea, Tabs, Text, Theme } from '@radix-ui/themes';
import { Wifi, Usb, Bluetooth, Cable, Printer, Check, Radar, RefreshCw } from 'lucide-react';
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
        <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogPrimitive.Portal>
                <Theme appearance="inherit" accentColor="cyan">
                    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
                    <DialogPrimitive.Content className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
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

                        {/* Connection Type Filter using Radix Tabs */}
                        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <Tabs.Root value={selectedConnectionType} onValueChange={(val) => onConnectionTypeChange(val as DiscoveryFilterType)}>
                                <Tabs.List>
                                    {CONNECTION_OPTIONS.map(opt => (
                                        <Tabs.Trigger
                                            key={opt.value}
                                            value={opt.value}
                                            disabled={isDiscovering}
                                        >
                                            <Flex align="center" gap="2">
                                                {opt.icon}
                                                {opt.label}
                                            </Flex>
                                        </Tabs.Trigger>
                                    ))}
                                </Tabs.List>
                            </Tabs.Root>
                        </div>

                        {/* Scrollable Content */}
                        <ScrollArea scrollbars="vertical" className="flex-1 pb-32">
                            {isDiscovering ? (
                                <Flex direction="column" align="center" justify="center" py="9">
                                    <div className="relative">
                                        <Radar className="w-16 h-16 text-sky-500 animate-pulse" />
                                        <div className="absolute inset-0 w-16 h-16 border-4 border-sky-500/30 rounded-full animate-ping" />
                                    </div>
                                    <Text size="3" color="gray" weight="medium" mt="6">
                                        Discovering {discoveryFilter.toLowerCase()} printers...
                                    </Text>
                                    <Text size="2" color="gray" mt="2">
                                        This may take a few seconds
                                    </Text>
                                </Flex>
                            ) : discoveredPrinters.length === 0 ? (
                                <Flex direction="column" align="center" justify="center" py="9">
                                    <Flex align="center" justify="center" className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
                                        <Radar className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                                    </Flex>
                                    <Text size="3" color="gray" weight="medium" mt="4">
                                        No printers discovered
                                    </Text>
                                    <Text size="2" color="gray" align="center" mt="2" className="px-8">
                                        Make sure your printers are turned on and connected to the same network
                                    </Text>
                                    <Button onClick={onRefresh} theme="primary" layout="outline" className="mt-6">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Try Again
                                    </Button>
                                </Flex>
                            ) : (
                                <Flex direction="column" gap="3" p="4">
                                    <Text size="2" color="gray" mb="1">
                                        Found {discoveredPrinters.length} printer(s). Select one to add.
                                    </Text>
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
                                                <Flex align="center" gap="4">
                                                    <Flex
                                                        align="center" justify="center"
                                                        className={`p-3 rounded-xl ${printer.isOnline
                                                            ? 'bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                            }`}
                                                    >
                                                        {getConnectionIcon(printer.connectionType)}
                                                    </Flex>
                                                    <Flex direction="column" gap="1" className="min-w-0 flex-1">
                                                        <Text size="2" weight="medium" truncate>
                                                            {printer.name}
                                                        </Text>
                                                        <Flex gap="1" wrap="wrap">
                                                            {printer.address && (
                                                                <Text size="1" color="gray" truncate className="max-w-[150px]">
                                                                    {printer.address}{printer.port ? `:${printer.port}` : ''}
                                                                </Text>
                                                            )}
                                                            {printer.manufacturer && (
                                                                <Text size="1" color="gray" truncate>• {printer.manufacturer}</Text>
                                                            )}
                                                        </Flex>
                                                        <Flex align="center" gap="2" mt="1">
                                                            <Badge
                                                                color={printer.connectionType === 'USB' ? 'purple' : 'blue'}
                                                                variant="soft" size="1"
                                                            >
                                                                {printer.connectionType}
                                                            </Badge>
                                                            <Badge
                                                                color={printer.isOnline ? 'green' : 'red'}
                                                                variant="soft" size="1"
                                                            >
                                                                {printer.isOnline ? 'Online' : 'Offline'}
                                                            </Badge>
                                                        </Flex>
                                                    </Flex>
                                                </Flex>
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
                                </Flex>
                            )}
                        </ScrollArea>

                        {/* Fixed Bottom Action Buttons */}
                        <Flex gap="3" p="4" className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 safe-area-bottom">
                            <Button onClick={onClose} layout="outline" theme="neutral" className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={onSave} theme="primary" disabled={!selectedPrinter || isSaving} className="flex-1">
                                {isSaving ? 'Adding...' : 'Add Printer'}
                            </Button>
                        </Flex>
                    </DialogPrimitive.Content>
                </Theme>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

export type { DiscoveryFilterType };
