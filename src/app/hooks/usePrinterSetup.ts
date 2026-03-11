import { useState, useCallback } from 'react';
import { Notify } from 'notiflix';
import printerService from '../services/printer.service';
import { usePrinterStore } from '../store/printerStore';

/**
 * Printer Setup Result
 */
export interface PrinterSetupResult {
    success: boolean;
    printer?: Printer;
    error?: string;
}

/**
 * Printer Registration Data
 */
export interface PrinterRegistrationData {
    printerName: string;
    printerType?: PrinterType;
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

/**
 * usePrinterSetup - Hook for printer discovery, registration, and testing
 * 
 * Features:
 * - Discover available printers (USB, Network, Bluetooth)
 * - Register discovered printers
 * - Test printer connections
 * - Validate printer configurations
 * 
 * Usage:
 * ```tsx
 * const { 
 *   discoverPrinters, 
 *   registerPrinter, 
 *   testPrinter,
 *   isDiscovering 
 * } = usePrinterSetup();
 * 
 * // Step 1: Discover printers
 * const discovered = await discoverPrinters(['USB', 'NETWORK']);
 * 
 * // Step 2: Register a discovered printer
 * const result = await registerPrinter({
 *   printerName: 'Receipt Printer',
 *   ...discovered[0],
 *   isDefault: true,
 *   isReceiptPrinter: true,
 * });
 * 
 * // Step 3: Test the printer
 * await testPrinter(result.printer.printerId);
 * ```
 */
export const usePrinterSetup = () => {
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [discoveredPrinters, setDiscoveredPrinters] = useState<DiscoveredPrinter[]>([]);

    const setDefaultReceiptPrinterId = usePrinterStore((state) => state.setDefaultReceiptPrinterId);
    const setDefaultLabelPrinterId = usePrinterStore((state) => state.setDefaultLabelPrinterId);
    const setDefaultKitchenPrinterId = usePrinterStore((state) => state.setDefaultKitchenPrinterId);

    /**
     * Discover available printers
     * @param connectionTypes - Types of connections to scan (defaults to all)
     */
    const discoverPrinters = useCallback(async (
        connectionTypes?: PrinterConnectionType[]
    ): Promise<DiscoveredPrinter[]> => {
        setIsDiscovering(true);

        try {
            const results: DiscoveredPrinter[] = [];

            // If specific types requested, discover for each type
            if (connectionTypes && connectionTypes.length > 0) {
                for (const type of connectionTypes) {
                    const result = await printerService.discover(type);
                    results.push(...result.printers);
                }
            } else {
                // Discover all types
                const result = await printerService.discover();
                results.push(...result.printers);
            }

            // Deduplicate by address/serial
            const uniquePrinters = results.reduce((acc, printer) => {
                const key = printer.serialNumber || printer.address || printer.name;
                if (!acc.some(p => (p.serialNumber || p.address || p.name) === key)) {
                    acc.push(printer);
                }
                return acc;
            }, [] as DiscoveredPrinter[]);

            setDiscoveredPrinters(uniquePrinters);

            if (uniquePrinters.length > 0) {
                Notify.success(`Found ${uniquePrinters.length} printer(s)`);
            } else {
                Notify.info('No printers discovered');
            }

            return uniquePrinters;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to discover printers';
            console.error('Printer discovery error:', errorMessage);
            Notify.failure(errorMessage);
            return [];
        } finally {
            setIsDiscovering(false);
        }
    }, []);

    /**
     * Scan network for printers
     * @param baseIP - Base IP address (e.g., '192.168.1')
     * @param startHost - Start host number (default 1)
     * @param endHost - End host number (default 254)
     * @param port - Port to scan (default 9100)
     */
    const scanNetwork = useCallback(async (
        baseIP: string,
        startHost?: number,
        endHost?: number,
        port?: number
    ): Promise<DiscoveredPrinter[]> => {
        setIsDiscovering(true);

        try {
            const result = await printerService.scanNetwork({
                baseIP,
                startHost,
                endHost,
                port,
            });

            if (result.printers.length > 0) {
                Notify.success(`Found ${result.printers.length} network printer(s)`);
            } else {
                Notify.info('No network printers found');
            }

            return result.printers;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to scan network';
            console.error('Network scan error:', errorMessage);
            Notify.failure(errorMessage);
            return [];
        } finally {
            setIsDiscovering(false);
        }
    }, []);

    /**
     * Register a printer
     * @param data - Printer registration data
     */
    const registerPrinter = useCallback(async (
        data: PrinterRegistrationData
    ): Promise<PrinterSetupResult> => {
        setIsRegistering(true);

        try {
            const printer = await printerService.create({
                printerName: data.printerName,
                printerType: data.printerType || 'THERMAL',
                connectionType: data.connectionType,
                connectionAddress: data.connectionAddress,
                port: data.port,
                vendorId: data.vendorId,
                productId: data.productId,
                serialNumber: data.serialNumber,
                isDefault: data.isDefault,
                isReceiptPrinter: data.isReceiptPrinter,
                isLabelPrinter: data.isLabelPrinter,
                isKitchenPrinter: data.isKitchenPrinter,
                isReportPrinter: data.isReportPrinter,
                configuration: data.configuration || {
                    paperWidth: 80,
                    autoPrintOnSale: true,
                },
            });

            // Update cached printer IDs if set as default
            if (data.isDefault || data.isReceiptPrinter) {
                setDefaultReceiptPrinterId(printer.printerId);
            }
            if (data.isLabelPrinter) {
                setDefaultLabelPrinterId(printer.printerId);
            }
            if (data.isKitchenPrinter) {
                setDefaultKitchenPrinterId(printer.printerId);
            }

            Notify.success('Printer registered successfully');

            return { success: true, printer };
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to register printer';
            console.error('Printer registration error:', errorMessage);
            Notify.failure(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsRegistering(false);
        }
    }, [setDefaultReceiptPrinterId, setDefaultLabelPrinterId, setDefaultKitchenPrinterId]);

    /**
     * Register a discovered printer directly
     */
    const registerDiscoveredPrinter = useCallback(async (
        discovered: DiscoveredPrinter,
        options?: {
            printerName?: string;
            isDefault?: boolean;
            isReceiptPrinter?: boolean;
            isLabelPrinter?: boolean;
            isKitchenPrinter?: boolean;
        }
    ): Promise<PrinterSetupResult> => {
        return registerPrinter({
            printerName: options?.printerName || discovered.name,
            printerType: discovered.type,
            connectionType: discovered.connectionType,
            connectionAddress: discovered.address,
            port: discovered.port,
            vendorId: discovered.vendorId,
            productId: discovered.productId,
            serialNumber: discovered.serialNumber,
            isDefault: options?.isDefault,
            isReceiptPrinter: options?.isReceiptPrinter ?? true,
            isLabelPrinter: options?.isLabelPrinter,
            isKitchenPrinter: options?.isKitchenPrinter,
        });
    }, [registerPrinter]);

    /**
     * Test printer connection
     */
    const testPrinter = useCallback(async (printerId: string): Promise<PrinterTestResult | null> => {
        setIsTesting(true);

        try {
            const result = await printerService.testConnection(printerId);

            if (result.success) {
                Notify.success(result.message || 'Printer connection successful');
            } else {
                Notify.warning(result.message || 'Printer test failed');
            }

            return result;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to test printer';
            console.error('Printer test error:', errorMessage);
            Notify.failure(errorMessage);
            return null;
        } finally {
            setIsTesting(false);
        }
    }, []);

    /**
     * Print test page
     */
    const printTestPage = useCallback(async (printerId: string): Promise<boolean> => {
        setIsTesting(true);

        try {
            await printerService.printTestPage(printerId);
            Notify.success('Test page sent to printer');
            return true;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to print test page';
            console.error('Print test page error:', errorMessage);
            Notify.failure(errorMessage);
            return false;
        } finally {
            setIsTesting(false);
        }
    }, []);

    /**
     * Validate printer configuration
     */
    const validatePrinter = useCallback(async (
        printerName: string,
        connectionType: PrinterConnectionType,
        connectionAddress?: string,
        port?: number
    ): Promise<ValidatePrinterResult | null> => {
        try {
            const result = await printerService.validatePrinter({
                printerName,
                connectionType,
                connectionAddress,
                port,
            });

            if (result.valid) {
                Notify.success('Printer configuration is valid');
            } else {
                Notify.warning(result.message || 'Invalid printer configuration');
            }

            return result;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to validate printer';
            console.error('Printer validation error:', errorMessage);
            Notify.failure(errorMessage);
            return null;
        }
    }, []);

    /**
     * Set printer as default
     */
    const setAsDefault = useCallback(async (
        printerId: string,
        printerType: 'receipt' | 'label' | 'kitchen' = 'receipt'
    ): Promise<boolean> => {
        try {
            const printer = await printerService.setDefault(printerId);

            // Update cached ID based on type
            switch (printerType) {
                case 'label':
                    setDefaultLabelPrinterId(printer.printerId);
                    break;
                case 'kitchen':
                    setDefaultKitchenPrinterId(printer.printerId);
                    break;
                case 'receipt':
                default:
                    setDefaultReceiptPrinterId(printer.printerId);
            }

            Notify.success('Default printer updated');
            return true;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to set default printer';
            console.error('Set default error:', errorMessage);
            Notify.failure(errorMessage);
            return false;
        }
    }, [setDefaultReceiptPrinterId, setDefaultLabelPrinterId, setDefaultKitchenPrinterId]);

    return {
        // Discovery
        discoverPrinters,
        scanNetwork,
        discoveredPrinters,
        isDiscovering,

        // Registration
        registerPrinter,
        registerDiscoveredPrinter,
        isRegistering,

        // Testing
        testPrinter,
        printTestPage,
        validatePrinter,
        isTesting,

        // Default Management
        setAsDefault,
    };
};

export default usePrinterSetup;
