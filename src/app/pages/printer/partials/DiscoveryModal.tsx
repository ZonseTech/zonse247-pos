import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Badge, Button, Flex, ScrollArea, Tabs, Text, Theme } from '@radix-ui/themes';
import { Wifi, Usb, Bluetooth, Cable, Printer, Check, Radar, RefreshCw } from 'lucide-react';
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

const TAB_TRIGGER_CLASS =
    '!rounded-full !shadow-none !px-3.5 !py-1.5 !text-sm !text-gray-500 dark:!text-gray-400 ' +
    'data-[state=active]:!bg-white dark:data-[state=active]:!bg-gray-700 ' +
    'data-[state=active]:!text-gray-900 dark:data-[state=active]:!text-gray-50 ' +
    'data-[state=active]:!shadow-sm transition-all';

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
                    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" />
                    <DialogPrimitive.Content className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col animate-slide-up">
                        {/* Fixed Header */}
                        <div className="flex-shrink-0 safe-area-top-android">
                            <MobilePageHeader
                                title="Discover Printers"
                                onLeftPress={onClose}
                                rightContent={
                                    <button
                                        onClick={onRefresh}
                                        disabled={isDiscovering}
                                        className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isDiscovering ? 'animate-spin' : ''}`} />
                                    </button>
                                }
                            />
                        </div>

                        {/* Connection Type Filter — pill segmented control */}
                        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <Tabs.Root value={selectedConnectionType} onValueChange={(val) => onConnectionTypeChange(val as DiscoveryFilterType)}>
                                <Tabs.List className="!gap-1 !shadow-none bg-gray-100 dark:bg-gray-800 p-1 rounded-full inline-flex">
                                    {CONNECTION_OPTIONS.map(opt => (
                                        <Tabs.Trigger
                                            key={opt.value}
                                            value={opt.value}
                                            disabled={isDiscovering}
                                            className={TAB_TRIGGER_CLASS}
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
                                    <div className="relative w-20 h-20 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400/20 to-sky-600/20 blur-xl" />
                                        <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full animate-ping" />
                                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/40 dark:to-sky-800/20 flex items-center justify-center ring-1 ring-sky-200/60 dark:ring-sky-800/60">
                                            <Radar className="w-8 h-8 text-sky-500 animate-pulse" />
                                        </div>
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
                                    <Flex align="center" justify="center" className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-800/60 ring-1 ring-gray-200/60 dark:ring-gray-700/60">
                                        <Radar className="w-9 h-9 text-gray-400 dark:text-gray-500" />
                                    </Flex>
                                    <Text size="3" color="gray" weight="medium" mt="4">
                                        No printers discovered
                                    </Text>
                                    <Text size="2" color="gray" align="center" mt="2" className="px-8">
                                        Make sure your printers are turned on and connected to the same network
                                    </Text>
                                    <Button onClick={onRefresh} variant="outline" radius="large" className="mt-6">
                                        <RefreshCw className="w-4 h-4" />
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
                                                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-150
                                                ${isSelected
                                                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-sm shadow-sky-500/10 ring-1 ring-sky-500/30'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'}`}
                                            >
                                                <Flex align="center" gap="4">
                                                    <Flex
                                                        align="center" justify="center"
                                                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${printer.isOnline
                                                            ? 'from-green-100 to-green-200 text-green-600 dark:from-green-900/40 dark:to-green-800/20 dark:text-green-400'
                                                            : 'from-gray-100 to-gray-200 text-gray-500 dark:from-gray-700 dark:to-gray-700/60 dark:text-gray-400'
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
                                                                <Text size="1" color="gray" truncate className="max-w-[150px] font-mono">
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
                                                                variant="soft" size="1" radius="full"
                                                            >
                                                                {printer.connectionType}
                                                            </Badge>
                                                            <Badge
                                                                color={printer.isOnline ? 'green' : 'red'}
                                                                variant="soft" size="1" radius="full"
                                                            >
                                                                {printer.isOnline ? 'Online' : 'Offline'}
                                                            </Badge>
                                                        </Flex>
                                                    </Flex>
                                                </Flex>
                                                {isSelected && (
                                                    <div className="flex-shrink-0 ml-3">
                                                        <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center animate-scale-in">
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
                        <Flex gap="3" p="4" className="border-t border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md safe-area-bottom">
                            <Button onClick={onClose} variant="outline" color="gray" size="3" radius="large" className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={onSave} disabled={!selectedPrinter || isSaving} size="3" radius="large" className="flex-1 shadow-lg shadow-sky-500/20">
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
