import { FunctionComponent, useState } from 'react';
import { Badge, Flex, IconButton, Table, Text, Tooltip } from '@radix-ui/themes';
import {
    Edit2, Trash2, Printer as PrinterIcon, Star, PowerOff,
    TestTube, FileText, Wifi, WifiOff, Copy, Check, AlertTriangle,
} from 'lucide-react';
import ComponentLoader from '../../../components/ComponentLoader';
import TableEmptyState from '../../../components/TableEmptyState';

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

const CONNECTION_ICONS: Record<PrinterConnectionType, string> = {
    USB: '🔌',
    NETWORK: '🌐',
    BLUETOOTH: '📶',
    SERIAL: '🔗',
    WIFI: '📡',
};

export const getConnectionTypeIcon = (type?: PrinterConnectionType): string =>
    (type && CONNECTION_ICONS[type]) || '🖨️';

const formatDate = (date?: string | Date | null): string => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
};

/** Connection-type-aware summary of how to reach the physical device. */
const getConnectionDetail = (printer: Printer): { primary: string; secondary?: string } => {
    const { connectionType, connectionAddress, port, baudRate, vendorId, productId, serialNumber } = printer;

    switch (connectionType) {
        case 'NETWORK':
        case 'WIFI':
            return {
                primary: connectionAddress || '—',
                secondary: port ? `Port ${port}` : undefined,
            };
        case 'SERIAL':
            return {
                primary: connectionAddress || '—',
                secondary: baudRate ? `${baudRate.toLocaleString()} baud` : undefined,
            };
        case 'USB':
            return {
                primary: connectionAddress || (vendorId && productId ? `VID:${vendorId} PID:${productId}` : '—'),
                secondary: serialNumber ? `SN ${serialNumber}` : undefined,
            };
        case 'BLUETOOTH':
            return { primary: connectionAddress || '—' };
        default:
            return { primary: connectionAddress || '—' };
    }
};

const CopyAddressButton: FunctionComponent<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Tooltip content={copied ? 'Copied!' : 'Copy address'}>
            <IconButton variant="ghost" color={copied ? 'green' : 'gray'} size="1" onClick={handleCopy}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </IconButton>
        </Tooltip>
    );
};

interface PrinterActionsProps {
    printer: Printer;
    onEdit: (printer: Printer) => void;
    onDelete: (printerId: string, printerName: string) => void;
    onSetDefault: (printerId: string) => void;
    onTestConnection: (printerId: string) => void;
    onPrintTestPage: (printerId: string) => void;
}

const PrinterActions: FunctionComponent<PrinterActionsProps> = ({
    printer, onEdit, onDelete, onSetDefault, onTestConnection, onPrintTestPage,
}) => (
    <Flex align="center" justify="end" gap="1">
        <Tooltip content={printer.isDefault ? 'Default printer' : 'Set as default'}>
            <IconButton
                variant="ghost"
                color={printer.isDefault ? 'yellow' : 'gray'}
                size="1"
                onClick={() => onSetDefault(printer.printerId)}
                disabled={printer.isDefault}
            >
                <Star className={`w-4 h-4 ${printer.isDefault ? 'fill-current' : ''}`} />
            </IconButton>
        </Tooltip>

        <Tooltip content="Test connection">
            <IconButton variant="ghost" color="sky" size="1" onClick={() => onTestConnection(printer.printerId)}>
                <TestTube className="w-4 h-4" />
            </IconButton>
        </Tooltip>

        <Tooltip content="Print test page">
            <IconButton variant="ghost" color="purple" size="1" onClick={() => onPrintTestPage(printer.printerId)}>
                <FileText className="w-4 h-4" />
            </IconButton>
        </Tooltip>

        <Tooltip content="Edit printer">
            <IconButton variant="ghost" color="blue" size="1" onClick={() => onEdit(printer)}>
                <Edit2 className="w-4 h-4" />
            </IconButton>
        </Tooltip>

        <Tooltip content="Delete printer">
            <IconButton variant="ghost" color="red" size="1" onClick={() => onDelete(printer.printerId, printer.printerName)}>
                <Trash2 className="w-4 h-4" />
            </IconButton>
        </Tooltip>
    </Flex>
);

interface PrinterTableProps {
    printers: Printer[];
    isLoading: boolean;
    searchTerm: string;
    page: number;
    perPage: number;
    totalRows: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onEdit: (printer: Printer) => void;
    onDelete: (printerId: string, printerName: string) => void;
    onSetDefault: (printerId: string) => void;
    onTestConnection: (printerId: string) => void;
    onPrintTestPage: (printerId: string) => void;
}

const PER_PAGE_OPTIONS = [10, 15, 25, 50];

export const PrinterTable: FunctionComponent<PrinterTableProps> = ({
    printers, isLoading, searchTerm, page, perPage, totalRows,
    onPageChange, onPerPageChange, onEdit, onDelete, onSetDefault, onTestConnection, onPrintTestPage,
}) => {
    const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
    const rangeStart = (page - 1) * perPage + 1;
    const rangeEnd = Math.min(page * perPage, totalRows);

    if (isLoading) {
        return <ComponentLoader loading />;
    }

    if (printers.length === 0) {
        return (
            <TableEmptyState
                icon={<PrinterIcon />}
                title={searchTerm ? 'No printers found' : 'No printers yet'}
                description={searchTerm ? 'Try a different search term.' : 'Discover or add a printer to get started.'}
            />
        );
    }

    return (
        <Flex direction="column">
            <Table.Root variant="surface" layout="auto">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>Printer</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Connection</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Purpose</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Paper</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Activity</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell justify="end">Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {printers.map((printer) => {
                        const connection = getConnectionDetail(printer);
                        const paperWidth = printer.configuration?.paperWidth;

                        return (
                            <Table.Row key={printer.printerId} align="center">
                                <Table.RowHeaderCell>
                                    <Flex align="center" gap="3">
                                        <div className="relative w-9 h-9 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ring-1 ring-gray-300 dark:ring-gray-600">
                                            <PrinterIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            {printer.isDefault && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 dark:bg-yellow-400 rounded-full flex items-center justify-center">
                                                    <Star className="w-2.5 h-2.5 text-white fill-current" />
                                                </div>
                                            )}
                                            {!printer.isActive && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-500 dark:bg-gray-400 rounded-full flex items-center justify-center">
                                                    <PowerOff className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <Flex direction="column" gap="0" className="min-w-0">
                                            <Flex align="center" gap="2">
                                                <Text size="2" weight="medium" className="truncate">{printer.printerName}</Text>
                                                <Badge color={getPrinterTypeBadgeColor(printer.printerType)} variant="soft" size="1">
                                                    {printer.printerType}
                                                </Badge>
                                                {!printer.isActive && (
                                                    <Badge color="gray" variant="soft" size="1">Inactive</Badge>
                                                )}
                                            </Flex>
                                            <Text size="1" color="gray" className="truncate">
                                                {printer.printerModel || 'No model'}
                                                {printer.serialNumber ? ` • SN: ${printer.serialNumber}` : ''}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Table.RowHeaderCell>

                                <Table.Cell>
                                    <Flex direction="column" gap="1">
                                        <Flex align="center" gap="1">
                                            <Text size="1" color="gray">
                                                {getConnectionTypeIcon(printer.connectionType)} {printer.connectionType}
                                            </Text>
                                        </Flex>
                                        <Flex align="center" gap="1">
                                            <Text size="1" className="font-mono text-gray-700 dark:text-gray-300 break-all">
                                                {connection.primary}
                                            </Text>
                                            {connection.primary !== '—' && <CopyAddressButton text={connection.primary} />}
                                        </Flex>
                                        {connection.secondary && (
                                            <Text size="1" color="gray">{connection.secondary}</Text>
                                        )}
                                    </Flex>
                                </Table.Cell>

                                <Table.Cell>
                                    <Flex wrap="wrap" gap="1" maxWidth="160px">
                                        {printer.isReceiptPrinter && <Badge color="blue" variant="soft" size="1">Receipt</Badge>}
                                        {printer.isLabelPrinter && <Badge color="teal" variant="soft" size="1">Label</Badge>}
                                        {printer.isKitchenPrinter && <Badge color="orange" variant="soft" size="1">Kitchen</Badge>}
                                        {printer.isReportPrinter && <Badge color="purple" variant="soft" size="1">Report</Badge>}
                                        {!printer.isReceiptPrinter && !printer.isLabelPrinter && !printer.isKitchenPrinter && !printer.isReportPrinter && (
                                            <Text size="1" color="gray">Not assigned</Text>
                                        )}
                                    </Flex>
                                </Table.Cell>

                                <Table.Cell>
                                    <Text size="1" color="gray">{paperWidth ? `${paperWidth}mm` : '—'}</Text>
                                </Table.Cell>

                                <Table.Cell>
                                    <Flex direction="column" gap="1">
                                        <Badge color={getStatusBadgeColor(printer.status)} variant="soft" size="1">
                                            {printer.status === 'ONLINE' ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                                            {printer.status}
                                        </Badge>
                                        {printer.lastError && (
                                            <Tooltip content={printer.lastError}>
                                                <Flex align="center" gap="1" className="cursor-default">
                                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                                    <Text size="1" color="red" className="truncate max-w-[140px]">{printer.lastError}</Text>
                                                </Flex>
                                            </Tooltip>
                                        )}
                                    </Flex>
                                </Table.Cell>

                                <Table.Cell>
                                    <Flex direction="column" gap="0">
                                        <Text size="1">{printer.printJobCount || 0} jobs</Text>
                                        <Text size="1" color="gray">Last: {formatDate(printer.lastPrintJob)}</Text>
                                        {!!printer.errorCount && printer.errorCount > 0 && (
                                            <Text size="1" color="red">{printer.errorCount} error(s)</Text>
                                        )}
                                    </Flex>
                                </Table.Cell>

                                <Table.Cell>
                                    <PrinterActions
                                        printer={printer}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onSetDefault={onSetDefault}
                                        onTestConnection={onTestConnection}
                                        onPrintTestPage={onPrintTestPage}
                                    />
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table.Root>

            <Flex align="center" justify="between" px="4" py="3" className="border-t border-gray-200 dark:border-gray-700">
                <Text size="1" color="gray">
                    Showing {rangeStart}-{rangeEnd} of {totalRows}
                </Text>

                <Flex align="center" gap="4">
                    <Flex align="center" gap="2">
                        <Text size="1" color="gray">Rows per page</Text>
                        <select
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            className="text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1"
                        >
                            {PER_PAGE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </Flex>

                    <Flex align="center" gap="2">
                        <IconButton
                            variant="soft" color="gray" size="1"
                            disabled={page <= 1}
                            onClick={() => onPageChange(page - 1)}
                        >
                            ‹
                        </IconButton>
                        <Text size="1" color="gray">Page {page} of {totalPages}</Text>
                        <IconButton
                            variant="soft" color="gray" size="1"
                            disabled={page >= totalPages}
                            onClick={() => onPageChange(page + 1)}
                        >
                            ›
                        </IconButton>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default PrinterTable;
