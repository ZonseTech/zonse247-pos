import { FunctionComponent, useState, ReactNode } from 'react';
import { Form, Formik } from 'formik';
import { Notify, Confirm } from 'notiflix';
import { X, Wifi, Usb, Bluetooth, Network, Star, Trash2, Power, TestTube, FileText, Printer } from 'lucide-react';
import { Button, FormSearchableSelect, FormFieldCard, TabOptionGroup, FormSwitch } from '../../../components';
import printerService from '../../../services/printer.service';
import MobilePageHeader from '../../../components/page/MobilePageHeader';

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
            const errorMessage = e?.error?.response?.data?.message || e?.response?.data?.message || e?.message || 'Failed to update printer';
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
        <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col">
            <MobilePageHeader
                title="Printer Details"
                onLeftPress={onClose}
                leftIcon={<span className={printer.isActive ? 'text-sky-500' : 'text-gray-400'}>
                    {getConnectionIcon(printer.connectionType)}
                </span>}
                rightContent={
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-500 dark:text-gray-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                }
            />

            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {printer.printerName}
                            </h2>
                            {printer.isDefault && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {printer.connectionType} • {printer.printerType}
                        </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${printer.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        {printer.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleSetDefault}
                        disabled={printer.isDefault}
                        className="p-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        title="Set as default"
                    >
                        <Star className={`w-5 h-5 ${printer.isDefault ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500 dark:text-gray-400'}`} />
                    </button>
                    <button
                        onClick={handleToggleActive}
                        className="p-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={printer.isActive ? 'Disable printer' : 'Enable printer'}
                    >
                        <Power className={`w-5 h-5 ${printer.isActive ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`} />
                    </button>
                    <button
                        onClick={handleTestConnection}
                        disabled={isTestingConnection}
                        className="p-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        title="Test connection"
                    >
                        <TestTube className={`w-5 h-5 text-sky-500 ${isTestingConnection ? 'animate-pulse' : ''}`} />
                    </button>
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            className="p-2.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete printer"
                        >
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
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
            </div>

            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 safe-area-bottom">
                <div className="flex flex-row gap-3">
                    <Button
                        type="button"
                        theme="success"
                        className="flex-1"
                        onClick={handlePrintTestPage}
                    >
                        TEST PRINT
                    </Button>
                    <Button
                        type="submit"
                        form="printer-form"
                        theme="success"
                        className="flex-1"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'DONE'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PrinterDetailModal;
