/**
 * Printer Types and Interfaces
 * Defines types for printer management in POS system
 * Note: PrinterInfo is for local system printers (in db-export.d.ts)
 * These types are for API-managed printers
 */

// Enums as union types
type PrinterType = 'THERMAL' | 'INKJET' | 'LASER' | 'DOT_MATRIX' | 'LABEL';
type PrinterConnectionType = 'USB' | 'NETWORK' | 'BLUETOOTH' | 'SERIAL' | 'WIFI';
type PrinterStatus = 'ONLINE' | 'OFFLINE' | 'BUSY' | 'ERROR' | 'PAPER_OUT' | 'COVER_OPEN';
type PrintJobStatus = 'PENDING' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
type PrintJobType = 'RECEIPT' | 'INVOICE' | 'REPORT' | 'LABEL' | 'BARCODE' | 'KITCHEN_ORDER' | 'TEST_PAGE';

interface PrinterConfiguration {
    paperWidth?: number;          // in mm (e.g., 58, 80)
    paperHeight?: number;         // in mm (for labels)
    dpi?: number;                 // dots per inch
    fontSize?: number;            // default font size
    encoding?: string;            // character encoding (e.g., 'UTF-8', 'CP437')
    cutPaper?: boolean;           // auto-cut after printing
    openCashDrawer?: boolean;     // open drawer after receipt
    printLogo?: boolean;          // print store logo
    logoUrl?: string;             // URL or path to logo
    headerLines?: string[];       // custom header text
    footerLines?: string[];       // custom footer text
    printSpeed?: number;          // print speed setting
    darkness?: number;            // print darkness/density (1-10)
    marginTop?: number;           // top margin in mm
    marginBottom?: number;        // bottom margin in mm
    marginLeft?: number;          // left margin in mm
    marginRight?: number;         // right margin in mm
    beepAfterPrint?: boolean;     // beep sound after print
    copies?: number;              // default number of copies
}

interface Printer {
    id?: number;
    printerId: string;
    tenantId: string;
    branchId: string;
    terminalId?: string | null;
    printerName: string;
    printerModel?: string | null;
    printerType: PrinterType;
    connectionType: PrinterConnectionType;
    connectionAddress?: string | null;    // IP address, MAC address, or device path
    port?: number | null;                 // Network port for network printers
    vendorId?: string | null;             // USB vendor ID
    productId?: string | null;            // USB product ID
    serialNumber?: string | null;
    isDefault: boolean;
    isReceiptPrinter: boolean;
    isLabelPrinter: boolean;
    isKitchenPrinter: boolean;
    isReportPrinter: boolean;
    status: PrinterStatus;
    configuration: PrinterConfiguration;
    lastConnected?: Date | string | null;
    lastPrintJob?: Date | string | null;
    printJobCount?: number;
    errorCount?: number;
    lastError?: string | null;
    isActive: boolean;
    synced?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

interface CreatePrinterRequest {
    tenantId?: string;
    branchId?: string;
    terminalId?: string;
    printerName: string;
    printerModel?: string;
    printerType: PrinterType;
    connectionType: PrinterConnectionType;
    connectionAddress?: string;
    port?: number;
    vendorId?: string;
    productId?: string;
    serialNumber?: string;
    isDefault?: boolean;
    isReceiptPrinter?: boolean;
    isLabelPrinter?: boolean;
    isKitchenPrinter?: boolean;
    isReportPrinter?: boolean;
    configuration?: PrinterConfiguration;
}

interface UpdatePrinterRequest {
    printerName?: string;
    printerModel?: string;
    printerType?: PrinterType;
    connectionType?: PrinterConnectionType;
    connectionAddress?: string;
    port?: number;
    vendorId?: string;
    productId?: string;
    serialNumber?: string;
    isDefault?: boolean;
    isReceiptPrinter?: boolean;
    isLabelPrinter?: boolean;
    isKitchenPrinter?: boolean;
    isReportPrinter?: boolean;
    status?: PrinterStatus;
    configuration?: PrinterConfiguration;
    isActive?: boolean;
}

interface PrinterQueryParams {
    tenantId?: string;
    branchId?: string;
    terminalId?: string;
    printerType?: PrinterType;
    connectionType?: PrinterConnectionType;
    status?: PrinterStatus;
    isDefault?: boolean;
    isReceiptPrinter?: boolean;
    isLabelPrinter?: boolean;
    isKitchenPrinter?: boolean;
    isReportPrinter?: boolean;
    isActive?: boolean;
    search?: string;
    paginated?: boolean;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface PrintJob {
    id?: number;
    printJobId: string;
    printerId: string;
    tenantId: string;
    branchId: string;
    terminalId?: string | null;
    userId?: string | null;
    jobType: PrintJobType;
    jobTitle: string;
    status: PrintJobStatus;
    content: string;                  // Content to print (HTML, raw commands, etc.)
    contentType?: string;             // 'HTML', 'RAW', 'ESC_POS', 'ZPL'
    copies?: number;
    priority?: number;                // 1-10, higher = more urgent
    referenceId?: string | null;      // Reference to sale, order, etc.
    referenceType?: string | null;    // 'SALE', 'ORDER', 'RETURN', etc.
    errorMessage?: string | null;
    printedAt?: Date | string | null;
    scheduledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

interface CreatePrintJobRequest {
    printerId: string;
    tenantId?: string;
    branchId?: string;
    terminalId?: string;
    userId?: string;
    jobType: PrintJobType;
    jobTitle: string;
    content: string;
    contentType?: string;
    copies?: number;
    priority?: number;
    referenceId?: string;
    referenceType?: string;
    scheduledAt?: Date | string;
}

interface PrintReceiptRequest {
    printerId?: string;               // Optional - uses default receipt printer if not specified
    saleId?: string;
    transactionId?: string;
    orderId?: string;
    copies?: number;
    includeHeader?: boolean;
    includeFooter?: boolean;
    includeLogo?: boolean;
    customMessage?: string;
}

interface PrintLabelRequest {
    printerId?: string;               // Optional - uses default label printer if not specified
    productId: string;
    quantity: number;
    includePrice?: boolean;
    includeBarcode?: boolean;
    includeQRCode?: boolean;
    customText?: string;
}

interface DiscoveredPrinter {
    name: string;
    address?: string;
    port?: number;
    type?: PrinterType;
    connectionType: PrinterConnectionType;
    vendorId?: string;
    productId?: string;
    serialNumber?: string;
    manufacturer?: string;
    model?: string;
    isOnline: boolean;
}

interface DiscoveryResult {
    count: number;
    printers: DiscoveredPrinter[];
    discoveredAt: string;
}

interface NetworkScanParams {
    baseIP: string;
    startHost?: number;
    endHost?: number;
    port?: number;
}

interface NetworkScanResult {
    baseIP: string;
    scannedRange: string;
    port: number;
    count: number;
    printers: DiscoveredPrinter[];
}

interface SerialPortInfo {
    path: string;
    manufacturer?: string;
    serialNumber?: string;
    pnpId?: string;
    locationId?: string;
    vendorId?: string;
    productId?: string;
}

interface CommonPortInfo {
    port: number;
    name: string;
    description: string;
    protocol: string;
}

interface ValidatePrinterRequest {
    printerName: string;
    connectionType: PrinterConnectionType;
    connectionAddress?: string;
    port?: number;
    vendorId?: string;
    productId?: string;
}

interface ValidatePrinterResult {
    valid: boolean;
    message: string;
    details?: {
        reachable?: boolean;
        responseTime?: number;
        printerInfo?: Partial<DiscoveredPrinter>;
    };
}

interface PrinterHealthStatus {
    printerId: string;
    printerName: string;
    status: PrinterStatus;
    isOnline: boolean;
    lastChecked: string;
    responseTime?: number;
    errorMessage?: string;
}

interface BranchPrinterHealth {
    branchId: string;
    totalPrinters: number;
    onlineCount: number;
    offlineCount: number;
    printers: PrinterHealthStatus[];
    checkedAt: string;
}

interface TenantPrinterHealth {
    tenantId: string;
    totalPrinters: number;
    onlineCount: number;
    offlineCount: number;
    branches: BranchPrinterHealth[];
    checkedAt: string;
}

interface PrinterTestResult {
    success: boolean;
    message: string;
    printerId: string;
    responseTime?: number;
    printerStatus?: PrinterStatus;
    errorDetails?: string;
}

// API Response Types
interface PrinterResponse {
    success: boolean;
    message?: string;
    data: Printer;
}

interface PrinterListResponse {
    success: boolean;
    message?: string;
    data: Printer[];
}

interface PrinterPaginatedResponse {
    success: boolean;
    message?: string;
    data: {
        printers: Printer[];
        pagination: {
            page: number;
            perPage: number;
            total: number;
            totalPages: number;
        };
    };
}

interface PrintJobResponse {
    success: boolean;
    message?: string;
    data: PrintJob;
}

interface PrintJobListResponse {
    success: boolean;
    message?: string;
    data: PrintJob[];
}

interface PrinterTestResponse {
    success: boolean;
    message?: string;
    data: PrinterTestResult;
}

interface DiscoveredPrinterResponse {
    success: boolean;
    message?: string;
    data: DiscoveryResult;
}

interface NetworkScanResponse {
    success: boolean;
    message?: string;
    data: NetworkScanResult;
}

interface SerialPortsResponse {
    success: boolean;
    message?: string;
    data: SerialPortInfo[];
}

interface CommonPortsResponse {
    success: boolean;
    message?: string;
    data: CommonPortInfo[];
}

interface ValidatePrinterResponse {
    success: boolean;
    message?: string;
    data: ValidatePrinterResult;
}

interface BranchHealthResponse {
    success: boolean;
    message?: string;
    data: BranchPrinterHealth;
}

interface TenantHealthResponse {
    success: boolean;
    message?: string;
    data: TenantPrinterHealth;
}

interface PrinterStatusUpdateRequest {
    status: PrinterStatus;
    errorMessage?: string;
}

interface CleanupJobsResponse {
    success: boolean;
    message?: string;
    data: {
        deletedCount: number;
    };
}

// ============================================
// PRINT AGENT TYPES
// ============================================

type PrintAgentStatus = 'RUNNING' | 'STOPPED' | 'ERROR' | 'STARTING' | 'STOPPING';

interface PrintAgentState {
    status: PrintAgentStatus;
    isRunning: boolean;
    startedAt?: string | null;
    stoppedAt?: string | null;
    lastError?: string | null;
    processedJobs: number;
    failedJobs: number;
    connectedPrinters: number;
    queueSize: number;
}

interface PrintAgentPermissions {
    hasSerialAccess: boolean;
    hasUsbAccess: boolean;
    serialPorts: string[];
    usbDevices: string[];
    missingPermissions: string[];
    instructions?: string;
}

interface PrintAgentSetupInstructions {
    os: string;
    instructions: string[];
    commands?: string[];
    links?: { label: string; url: string }[];
}

interface PrintQueueStatus {
    queueSize: number;
    pendingJobs: number;
    processingJobs: number;
    failedJobs: number;
    completedToday: number;
    failedJobsList: PrintJob[];
}

interface RegisterPrinterRequest {
    discoveredPrinter: DiscoveredPrinter;
    printerName?: string;
    isDefault?: boolean;
    isReceiptPrinter?: boolean;
    isLabelPrinter?: boolean;
    isKitchenPrinter?: boolean;
    isReportPrinter?: boolean;
    configuration?: PrinterConfiguration;
}

// Print Agent Response Types
interface PrintAgentStatusResponse {
    success: boolean;
    message?: string;
    data: PrintAgentState;
}

interface PrintAgentPermissionsResponse {
    success: boolean;
    message?: string;
    data: PrintAgentPermissions;
}

interface PrintAgentSetupResponse {
    success: boolean;
    message?: string;
    data: PrintAgentSetupInstructions;
}

interface PrintQueueStatusResponse {
    success: boolean;
    message?: string;
    data: PrintQueueStatus;
}

interface PrintQueueActionResponse {
    success: boolean;
    message?: string;
    data: {
        affected: number;
        message: string;
    };
}
