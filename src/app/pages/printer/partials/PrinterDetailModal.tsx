import { FunctionComponent, useState, ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Badge, Flex, Heading, IconButton, ScrollArea, Separator, Text, Tooltip, Theme } from '@radix-ui/themes';
import { Form, Formik } from 'formik';
import { Notify, Confirm } from 'notiflix';
import { Wifi, Usb, Bluetooth, Network, Star, Trash2, Power, TestTube, FileText, Printer } from 'lucide-react';
import { Button, FormSearchableSelect, FormFieldCard, TabOptionGroup, FormSwitch } from '../../../components';
import printerService from '../../../services/printer.service';
import MobilePageHeader from '../../../components/page/MobilePageHeader';
import { getErrorMessage } from '../../../utils/api-error-handler';

interface PrinterDetailModalProps {
    isOpen: boolean;
    printer: Printer | null;
    onClose: () => void;
    onSave: () => void;
    onDelete?: (printerId: string) => void;
}

const PAPER_WIDTH_OPTIONS = [
    { value: 58, label: '58mm', icon: <Printer className="w-5 h-5" /> },
    { value: 80, label: '80mm', icon: <Printer className="w-5 h-5" /> },
    { value: 110, label: '110mm', icon: <Printer className="w-5 h-5" /> },
];

const PRINTER_CONTENT_OPTIONS = [
    { value: 'receipt', label: 'Receipt' },
    { value: 'report', label: 'Report' },
    { value: 'label', label: 'Label' },
    { value: 'kitchen', label: 'Kitchen' },
];

const PRINT_MODE_OPTIONS = [
    { value: 'normal', label: 'Normal' },
    { value: 'draft', label: 'Draft' },
    { value: 'high', label: 'High Quality' },
];

const LINE_SPACING_OPTIONS = [
    { label: 'Compact', value: 1 },
    { label: 'Normal', value: 1.5 },
    { label: 'Relaxed', value: 2 },
    { label: 'Loose', value: 2.5 },
];

const FONT_SIZE_OPTIONS = [
    { label: 'Extra Small (8pt)', value: 8 },
    { label: 'Small (10pt)', value: 10 },
    { label: 'Medium (12pt)', value: 12 },
    { label: 'Large (14pt)', value: 14 },
    { label: 'Extra Large (16pt)', value: 16 },
];

const PrinterDetailModal: FunctionComponent<PrinterDetailModalProps> = ({
    isOpen,
    printer,
    onClose,
    onSave,
    onDelete
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);

    const getConnectionIcon = (type: PrinterConnectionType): ReactNode => {
        const icons: Record<PrinterConnectionType, ReactNode> = {
            'USB': <Usb className="w-5 h-5" />,
            'NETWORK': <Network className="w-5 h-5" />,
            'BLUETOOTH': <Bluetooth className="w-5 h-5" />,
            'SERIAL': <Network className="w-5 h-5" />,
            'WIFI': <Wifi className="w-5 h-5" />
        };
        return icons[type] || <Network className="w-5 h-5" />;
    };

    const handleSubmit = async (values: any) => {
        if (!printer?.printerId) return;

        setIsSaving(true);
        try {
            await printerService.update(printer.printerId, {
                ...printer,
                isReceiptPrinter: values.printerContent === 'receipt',
                isReportPrinter: values.printerContent === 'report',
                isLabelPrinter: values.printerContent === 'label',
                isKitchenPrinter: values.printerContent === 'kitchen',
                configuration: {
                    ...printer.configuration,
                    paperWidth: values.paperWidth,
                    fontSize: values.fontSize,
                    lineSpacing: values.lineSpacing,
                    printMode: values.printMode,
                    autoPrintOnSale: values.autoPrintOnSale,
                }
            });
            Notify.success('Printer updated successfully');
            onSave();
            onClose();
        } catch (e: any) {
            const errorMessage = getErrorMessage(e, 'Failed to update printer');
            Notify.failure(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        if (!printer?.printerId || !onDelete) return;

        Confirm.show(
            'Delete Printer',
            `Are you sure you want to delete "${printer.printerName}"?`,
            'Delete',
            'Cancel',
            () => {
                onDelete(printer.printerId);
                onClose();
            },
            () => { },
            { titleColor: '#ef4444', okButtonBackground: '#ef4444' }
        );
    };

    const handleSetDefault = async () => {
        if (!printer?.printerId) return;

        try {
            await printerService.setDefault(printer.printerId);
            Notify.success('Printer set as default');
            onSave();
        } catch (e: any) {
            Notify.failure('Failed to set as default');
        }
    };

    const handleToggleActive = async () => {
        if (!printer?.printerId) return;

        try {
            if (printer.isActive) {
                await printerService.deactivate(printer.printerId);
                Notify.success('Printer deactivated');
            } else {
                await printerService.activate(printer.printerId);
                Notify.success('Printer activated');
            }
            onSave();
        } catch (e: any) {
            Notify.failure('Failed to update printer status');
        }
    };

    const handleTestConnection = async () => {
        if (!printer?.printerId) return;

        setIsTestingConnection(true);
        try {
            const result = await printerService.testConnection(printer.printerId);
            if (result?.success) {
                Notify.success('Connection successful');
            } else {
                Notify.warning(result?.message || 'Connection test failed');
            }
        } catch (e: any) {
            Notify.failure('Connection test failed');
        } finally {
            setIsTestingConnection(false);
        }
    };

    const handlePrintTestPage = async () => {
        if (!printer?.printerId) return;

        try {
            await printerService.printTestPage(printer.printerId);
            Notify.success('Test page sent to printer');
        } catch (e: any) {
            Notify.failure('Failed to print test page');
        }
    };

    if (!isOpen || !printer) return null;

    const initialValues = {
        paperWidth: printer.configuration?.paperWidth || 80,
        printerContent: printer.isReceiptPrinter ? 'receipt' : printer.isReportPrinter ? 'report' : printer.isLabelPrinter ? 'label' : printer.isKitchenPrinter ? 'kitchen' : 'receipt',
        printMode: printer.configuration?.printMode || 'normal',
        autoPrintOnSale: printer.configuration?.autoPrintOnSale || false,
        lineSpacing: printer.configuration?.lineSpacing || 1.5,
        fontSize: printer.configuration?.fontSize || 12,
    };

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogPrimitive.Portal>
                <Theme appearance="inherit" accentColor="cyan">
                    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
                    <DialogPrimitive.Content className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col">
                        <MobilePageHeader
                            title="Printer Details"
                            onLeftPress={onClose}
                            leftIcon={<span className={printer.isActive ? 'text-sky-500' : 'text-gray-400'}>
                                {getConnectionIcon(printer.connectionType)}
                            </span>}
                            rightContent={
                                <DialogPrimitive.Close asChild>
                                    <IconButton variant="ghost" color="gray" size="2">
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    </IconButton>
                                </DialogPrimitive.Close>
                            }
                        />

                        {/* Printer Info Header */}
                        <Flex direction="column" gap="3" p="4" className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <Flex align="center" gap="3">
                                <Flex direction="column" gap="1" className="flex-1 min-w-0">
                                    <Flex align="center" gap="2">
                                        <Heading size="3" truncate>{printer.printerName}</Heading>
                                        {printer.isDefault && (
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                        )}
                                    </Flex>
                                    <Text size="2" color="gray">
                                        {printer.connectionType} • {printer.printerType}
                                    </Text>
                                </Flex>
                                <Badge color={printer.isActive ? 'green' : 'gray'} variant="soft" size="1">
                                    {printer.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </Flex>

                            <Separator size="4" />

                            <Flex align="center" justify="end" gap="1">
                                <Tooltip content={printer.isDefault ? 'Default printer' : 'Set as default'}>
                                    <IconButton
                                        variant="ghost"
                                        color={printer.isDefault ? 'yellow' : 'gray'}
                                        size="2"
                                        onClick={handleSetDefault}
                                        disabled={printer.isDefault}
                                    >
                                        <Star className={`w-5 h-5 ${printer.isDefault ? 'fill-current' : ''}`} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip content={printer.isActive ? 'Disable printer' : 'Enable printer'}>
                                    <IconButton variant="ghost" color={printer.isActive ? 'green' : 'gray'} size="2" onClick={handleToggleActive}>
                                        <Power className="w-5 h-5" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip content="Test connection">
                                    <IconButton variant="ghost" color="blue" size="2" onClick={handleTestConnection} disabled={isTestingConnection}>
                                        <TestTube className={`w-5 h-5 ${isTestingConnection ? 'animate-pulse' : ''}`} />
                                    </IconButton>
                                </Tooltip>
                                {onDelete && (
                                    <Tooltip content="Delete printer">
                                        <IconButton variant="ghost" color="red" size="2" onClick={handleDelete}>
                                            <Trash2 className="w-5 h-5" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Flex>
                        </Flex>

                        {/* Scrollable Form Content */}
                        <ScrollArea scrollbars="vertical" className="flex-1">
                            <Formik
                                initialValues={initialValues}
                                onSubmit={handleSubmit}
                                enableReinitialize
                            >
                                {() => (
                                    <Form id="printer-form" className="p-4 pb-6 space-y-6">
                                        <FormFieldCard title="Paper Width">
                                            <TabOptionGroup
                                                name="paperWidth"
                                                options={PAPER_WIDTH_OPTIONS}
                                                size="md"
                                                columns={3}
                                            />
                                        </FormFieldCard>

                                        <FormFieldCard title="Printer Content">
                                            <TabOptionGroup
                                                name="printerContent"
                                                options={PRINTER_CONTENT_OPTIONS}
                                                columns={4}
                                                size="md"
                                            />
                                        </FormFieldCard>

                                        <FormFieldCard title="Print Mode">
                                            <TabOptionGroup
                                                name="printMode"
                                                options={PRINT_MODE_OPTIONS}
                                                size="md"
                                                columns={3}
                                            />
                                        </FormFieldCard>

                                        <FormFieldCard title="Additional Options">
                                            <div className="space-y-4">
                                                <FormSwitch
                                                    name="autoPrintOnSale"
                                                    label="Print automatically on sale"
                                                />

                                                <FormSearchableSelect
                                                    label="Line Spacing"
                                                    name="lineSpacing"
                                                    options={LINE_SPACING_OPTIONS}
                                                    placeholder="Select line spacing"
                                                    isClearable={false}
                                                />

                                                <FormSearchableSelect
                                                    label="Font Size"
                                                    name="fontSize"
                                                    options={FONT_SIZE_OPTIONS}
                                                    placeholder="Select font size"
                                                    isClearable={false}
                                                />
                                            </div>
                                        </FormFieldCard>
                                    </Form>
                                )}
                            </Formik>
                        </ScrollArea>

                        {/* Footer Actions */}
                        <Flex gap="3" p="4" className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 safe-area-bottom">
                            <Button type="button" theme="success" className="flex-1" onClick={handlePrintTestPage}>
                                TEST PRINT
                            </Button>
                            <Button type="submit" form="printer-form" theme="success" className="flex-1" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'DONE'}
                            </Button>
                        </Flex>
                    </DialogPrimitive.Content>
                </Theme>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

export default PrinterDetailModal;
