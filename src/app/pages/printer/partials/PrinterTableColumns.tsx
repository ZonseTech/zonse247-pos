import { Fragment, FunctionComponent } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Badge, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';
import { Edit2, Trash2, Printer, Star, Power, PowerOff, TestTube, FileText, Wifi, WifiOff } from 'lucide-react';
import { HiOutlineMenuAlt4 } from 'react-icons/hi';

interface PrinterActionsProps {
    printer: Printer;
    onEdit: (printer: Printer) => void;
    onDelete: (printerId: string, printerName: string) => void;
    onSetDefault: (printerId: string) => void;
    onToggleActive: (printerId: string, isActive: boolean) => void;
    onTestConnection: (printerId: string) => void;
    onPrintTestPage: (printerId: string) => void;
}

const PrinterActions: FunctionComponent<PrinterActionsProps> = ({
    printer,
    onEdit,
    onDelete,
    onSetDefault,
    onToggleActive,
    onTestConnection,
    onPrintTestPage
}) => {
    return (
        <Flex align="center" gap="1">
            <Tooltip content={printer.isDefault ? 'Default printer' : 'Set as default'}>
                <IconButton
                    variant="ghost"
                    color={printer.isDefault ? 'yellow' : 'gray'}
                    size="1"
                    onClick={() => onSetDefault(printer.printerId)}
                >
                    <Star className={`w-4 h-4 ${printer.isDefault ? 'fill-current' : ''}`} />
                </IconButton>
            </Tooltip>

            <Tooltip content="Edit printer">
                <IconButton
                    variant="ghost"
                    color="blue"
                    size="1"
                    onClick={() => onEdit(printer)}
                >
                    <Edit2 className="w-4 h-4" />
                </IconButton>
            </Tooltip>
        </Flex>
    );
};

export const getStatusBadgeColor = (status?: PrinterStatus): 'green' | 'gray' | 'yellow' | 'red' | 'orange' | 'amber' => {
    switch (status) {
        case 'ONLINE': return 'green';
        case 'OFFLINE': return 'gray';
        case 'BUSY': return 'yellow';
        case 'ERROR': return 'red';
        case 'PAPER_OUT': return 'orange';
        case 'COVER_OPEN': return 'amber';
        default: return 'gray';
    }
};

export const getStatusColor = (status?: PrinterStatus): string => {
    switch (status) {
        case 'ONLINE':
            return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700';
        case 'OFFLINE':
            return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
        case 'BUSY':
            return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
        case 'ERROR':
            return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700';
        case 'PAPER_OUT':
            return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
        case 'COVER_OPEN':
            return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700';
        default:
            return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
    }
};

const getStatusDotColor = (status?: PrinterStatus): string => {
    switch (status) {
        case 'ONLINE':
            return 'bg-green-400 dark:bg-green-300';
        case 'OFFLINE':
            return 'bg-gray-400 dark:bg-gray-500';
        case 'BUSY':
            return 'bg-yellow-400 dark:bg-yellow-300';
        case 'ERROR':
            return 'bg-red-400 dark:bg-red-300';
        case 'PAPER_OUT':
            return 'bg-orange-400 dark:bg-orange-300';
        case 'COVER_OPEN':
            return 'bg-amber-400 dark:bg-amber-300';
        default:
            return 'bg-gray-400 dark:bg-gray-500';
    }
};

export const getPrinterTypeBadgeColor = (type?: PrinterType): 'blue' | 'purple' | 'indigo' | 'gray' | 'teal' => {
    switch (type) {
        case 'THERMAL': return 'blue';
        case 'INKJET': return 'purple';
        case 'LASER': return 'indigo';
        case 'DOT_MATRIX': return 'gray';
        case 'LABEL': return 'teal';
        default: return 'gray';
    }
};

export const getPrinterTypeColor = (type?: PrinterType): string => {
    switch (type) {
        case 'THERMAL':
            return 'bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300';
        case 'INKJET':
            return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
        case 'LASER':
            return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300';
        case 'DOT_MATRIX':
            return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
        case 'LABEL':
            return 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300';
        default:
            return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
};

export const getConnectionTypeIcon = (type?: PrinterConnectionType): string => {
    switch (type) {
        case 'USB':
            return '🔌';
        case 'NETWORK':
            return '🌐';
        case 'BLUETOOTH':
            return '📶';
        case 'SERIAL':
            return '🔗';
        case 'WIFI':
            return '📡';
        default:
            return '🖨️';
    }
};

const formatDate = (date?: string | Date | null): string => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getPrinterColumns = (
    onEdit: (printer: Printer) => void,
    onDelete: (printerId: string, printerName: string) => void,
    onSetDefault: (printerId: string) => void,
    onToggleActive: (printerId: string, isActive: boolean) => void,
    onTestConnection: (printerId: string) => void,
    onPrintTestPage: (printerId: string) => void
): Array<TableColumn<Printer>> => {
    return [
        {
            name: 'Printer',
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="relative w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ring-1 ring-gray-300 dark:ring-gray-600">
                            <Printer className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            {row.isDefault && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 dark:bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Star className="w-2.5 h-2.5 text-white fill-current" />
                                </div>
                            )}
                            {!row.isActive && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-500 dark:bg-gray-400 rounded-full flex items-center justify-center">
                                    <PowerOff className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center flex-wrap gap-2">
                                <span className="truncate">{row.printerName}</span>
                                {row.isDefault ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                                        Default
                                    </span>
                                ) : null}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center">
                                    {row.printerModel || 'No model'}
                                    {row.serialNumber ? (
                                        <>
                                            <span className="mx-1">•</span>
                                            <span className="truncate">SN: {row.serialNumber}</span>
                                        </>
                                    ) : null}
                                </span>
                            </div>
                            {row.connectionAddress ? (
                                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                                    <span className="mr-1">{getConnectionTypeIcon(row.connectionType)}</span>
                                    {row.connectionAddress}
                                    {row.port ? `:${row.port}` : ''}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </Fragment>
            ),
            grow: 2
        },
        {
            name: 'Type',
            cell: (row) => (
                <Fragment>
                    <Flex direction="column" gap="1">
                        <Badge color={getPrinterTypeBadgeColor(row.printerType)} variant="soft" size="1">
                            {row.printerType}
                        </Badge>
                        <Text size="1" color="gray">
                            {getConnectionTypeIcon(row.connectionType)} {row.connectionType}
                        </Text>
                    </Flex>
                </Fragment>
            ),
        },
        {
            name: 'Purpose',
            cell: (row) => (
                <Fragment>
                    <Flex wrap="wrap" gap="1">
                        {row.isReceiptPrinter && <Badge color="blue" variant="soft" size="1">Receipt</Badge>}
                        {row.isLabelPrinter && <Badge color="teal" variant="soft" size="1">Label</Badge>}
                        {row.isKitchenPrinter && <Badge color="orange" variant="soft" size="1">Kitchen</Badge>}
                        {row.isReportPrinter && <Badge color="purple" variant="soft" size="1">Report</Badge>}
                        {!row.isReceiptPrinter && !row.isLabelPrinter && !row.isKitchenPrinter && !row.isReportPrinter && (
                            <Text size="1" color="gray">Not assigned</Text>
                        )}
                    </Flex>
                </Fragment>
            ),
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    <Flex direction="column" gap="1">
                        <Badge color={getStatusBadgeColor(row.status)} variant="soft" size="1">
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotColor(row.status)}`} />
                            {row.status}
                        </Badge>
                        {!row.isActive && <Text size="1" color="gray">Inactive</Text>}
                    </Flex>
                </Fragment>
            ),
        },
        {
            name: 'Print Jobs',
            cell: (row) => (
                <Fragment>
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {row.printJobCount || 0} jobs
                        </div>
                        {row.lastPrintJob ? (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Last: {formatDate(row.lastPrintJob)}
                            </div>
                        ) : null}
                        {row.errorCount && row.errorCount > 0 ? (
                            <div className="text-xs text-red-500 dark:text-red-400">
                                {row.errorCount} error(s)
                            </div>
                        ) : null}
                    </div>
                </Fragment>
            ),
        },
        {
            width: '300px',
            name: <HiOutlineMenuAlt4 className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
            cell: (row) => (
                <PrinterActions
                    printer={row}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onSetDefault={onSetDefault}
                    onToggleActive={onToggleActive}
                    onTestConnection={onTestConnection}
                    onPrintTestPage={onPrintTestPage}
                />
            )
        }
    ];
};
