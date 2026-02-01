import { FunctionComponent, ReactNode } from 'react';
import {
    Printer,
    Wifi,
    WifiOff,
    Usb,
    Bluetooth,
    Network,
    Star,
    MoreVertical,
    Edit,
    Trash2,
    Power,
    TestTube,
    FileText
} from 'lucide-react';

interface PrinterMobileCardProps {
    printer: Printer;
    onEdit: (printer: Printer) => void;
    onDelete: (printerId: string, printerName: string) => void;
    onSetDefault: (printerId: string) => void;
    onToggleActive: (printerId: string, isActive: boolean) => void;
    onTestConnection: (printerId: string) => Promise<PrinterTestResult | null>;
    onPrintTestPage: (printerId: string) => void;
}

const PrinterMobileCard: FunctionComponent<PrinterMobileCardProps> = ({
    printer,
    onEdit,
    onDelete,
    onSetDefault,
    onToggleActive,
    onTestConnection,
    onPrintTestPage
}) => {
    const getStatusConfig = (status: PrinterStatus) => {
        const configs: Record<PrinterStatus, { color: string; bgColor: string; label: string }> = {
            'ONLINE': { color: 'text-green-500 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', label: 'Online' },
            'OFFLINE': { color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-700', label: 'Offline' },
            'BUSY': { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Busy' },
            'ERROR': { color: 'text-red-500 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', label: 'Error' },
            'PAPER_OUT': { color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', label: 'Paper Out' },
            'COVER_OPEN': { color: 'text-amber-500 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', label: 'Cover Open' }
        };
        return configs[status] || configs['OFFLINE'];
    };

    const getConnectionIcon = (type: PrinterConnectionType) => {
        const icons: Record<PrinterConnectionType, ReactNode> = {
            'USB': <Usb className="w-4 h-4" />,
            'NETWORK': <Network className="w-4 h-4" />,
            'BLUETOOTH': <Bluetooth className="w-4 h-4" />,
            'SERIAL': <Network className="w-4 h-4" />,
            'WIFI': <Wifi className="w-4 h-4" />
        };
        return icons[type] || <Network className="w-4 h-4" />;
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

    const statusConfig = getStatusConfig(printer.status);

    const getPrinterRoles = () => {
        const roles: string[] = [];
        if (printer.isReceiptPrinter) roles.push('Receipt');
        if (printer.isLabelPrinter) roles.push('Label');
        if (printer.isKitchenPrinter) roles.push('Kitchen');
        if (printer.isReportPrinter) roles.push('Report');
        return roles;
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${printer.isActive ? 'bg-sky-100 dark:bg-sky-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <Printer className={`w-5 h-5 ${printer.isActive ? 'text-sky-500 dark:text-sky-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                {printer.printerName}
                            </h3>
                            {printer.isDefault && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                        </div>
                        {printer.printerModel && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {printer.printerModel}
                            </p>
                        )}
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label}
                </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Type</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                        {getPrinterTypeLabel(printer.printerType)}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Connection</span>
                    <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                        {getConnectionIcon(printer.connectionType)}
                        <span>{printer.connectionType}</span>
                    </div>
                </div>
                {printer.connectionAddress && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Address</span>
                        <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">
                            {printer.connectionAddress}
                            {printer.port && `:${printer.port}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Printer Roles */}
            {getPrinterRoles().length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {getPrinterRoles().map((role) => (
                        <span
                            key={role}
                            className="px-2 py-0.5 text-xs rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                        >
                            {role}
                        </span>
                    ))}
                </div>
            )}

            {/* Stats */}
            {(printer.printJobCount !== undefined || printer.errorCount !== undefined) && (
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                    {printer.printJobCount !== undefined && (
                        <span>Jobs: {printer.printJobCount}</span>
                    )}
                    {printer.errorCount !== undefined && printer.errorCount > 0 && (
                        <span className="text-red-500">Errors: {printer.errorCount}</span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(printer)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onTestConnection(printer.printerId)}
                        className="p-2 text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                        title="Test Connection"
                    >
                        <TestTube className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onPrintTestPage(printer.printerId)}
                        className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="Print Test Page"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    {!printer.isDefault && (
                        <button
                            onClick={() => onSetDefault(printer.printerId)}
                            className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                            title="Set as Default"
                        >
                            <Star className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => onToggleActive(printer.printerId, printer.isActive)}
                        className={`p-2 rounded-lg transition-colors ${printer.isActive
                            ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                        title={printer.isActive ? 'Deactivate' : 'Activate'}
                    >
                        <Power className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(printer.printerId, printer.printerName)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Skeleton loader
export const PrinterMobileCardSkeleton: FunctionComponent = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="space-y-2 mb-3">
            <div className="flex justify-between">
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
        <div className="flex gap-2 mb-3">
            <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-1">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="flex gap-1">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
        </div>
    </div>
);

// Mobile List Component
interface PrinterMobileListProps {
    printers: Printer[];
    onEdit: (printer: Printer) => void;
    onDelete: (printerId: string, printerName: string) => void;
    onSetDefault: (printerId: string) => void;
    onToggleActive: (printerId: string, isActive: boolean) => void;
    onTestConnection: (printerId: string) => Promise<PrinterTestResult | null>;
    onPrintTestPage: (printerId: string) => void;
    isLoading: boolean;
}

export const PrinterMobileList: FunctionComponent<PrinterMobileListProps> = ({
    printers,
    onEdit,
    onDelete,
    onSetDefault,
    onToggleActive,
    onTestConnection,
    onPrintTestPage,
    isLoading
}) => {
    if (isLoading) {
        return (
            <div className="space-y-3 p-4">
                {[...Array(3)].map((_, i) => (
                    <PrinterMobileCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4">
            {printers.map((printer) => (
                <PrinterMobileCard
                    key={printer.printerId}
                    printer={printer}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onSetDefault={onSetDefault}
                    onToggleActive={onToggleActive}
                    onTestConnection={onTestConnection}
                    onPrintTestPage={onPrintTestPage}
                />
            ))}
        </div>
    );
};

export default PrinterMobileCard;
