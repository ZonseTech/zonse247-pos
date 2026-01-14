/**
 * Barcode Scanner Service
 * Handles camera-based barcode scanning using Capacitor ML Kit
 * Supports both physical barcode scanners (via keyboard input) and camera scanning
 */

import { Capacitor } from '@capacitor/core';
import {
    BarcodeScanner,
    BarcodeFormat,
    LensFacing,
    Resolution,
    type Barcode,
    type StartScanOptions,
    type BarcodesScannedEvent,
    type ScanOptions,
} from '@capacitor-mlkit/barcode-scanning';

export type ScannerMode = 'camera' | 'physical' | 'both';

export interface ScannerConfig {
    formats?: BarcodeFormat[];
    lensFacing?: LensFacing;
    continuous?: boolean;
}

export interface ScannerResult {
    barcode: string;
    format: string;
    rawValue: string;
    displayValue?: string;
}

export interface ScannerStatus {
    isSupported: boolean;
    isAvailable: boolean;
    hasPermission: boolean;
    isScanning: boolean;
}

// Default barcode formats to scan - LIMITED for faster scanning performance
// Only include formats commonly used in retail POS systems
const DEFAULT_FORMATS: BarcodeFormat[] = [
    BarcodeFormat.Ean13,
    BarcodeFormat.Ean8,
    BarcodeFormat.UpcA,
    BarcodeFormat.UpcE,
    BarcodeFormat.Code128,
];

// Extended formats for QR/2D scanning (use only when needed)
export const EXTENDED_FORMATS: BarcodeFormat[] = [
    ...DEFAULT_FORMATS,
    BarcodeFormat.QrCode,
    BarcodeFormat.Code39,
    BarcodeFormat.DataMatrix,
];

class BarcodeScannerService {
    private isScanning = false;
    private scanListeners: ((result: ScannerResult) => void)[] = [];
    private errorListeners: ((error: Error) => void)[] = [];
    private torchState = false;
    private isGoogleBarcodeScannerAvailable: boolean | null = null;

    constructor() {
        // Pre-check Google Barcode Scanner availability in background (non-blocking)
        this.checkGoogleBarcodeScannerModule();
    }

    /**
     * Pre-check if Google Barcode Scanner module is available (non-blocking)
     */
    private async checkGoogleBarcodeScannerModule(): Promise<void> {
        try {
            const result = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
            this.isGoogleBarcodeScannerAvailable = result.available;

            // If not available, start installation in background
            if (!result.available) {
                BarcodeScanner.installGoogleBarcodeScannerModule().catch(() => {
                    // Silently fail - will use bundled ML model
                });
            }
        } catch {
            this.isGoogleBarcodeScannerAvailable = false;
        }
    }

    /**
     * Check if the device supports camera-based barcode scanning
     */
    async isSupported(): Promise<boolean> {
        try {
            const result = await BarcodeScanner.isSupported();
            return result.supported;
        } catch (error) {
            console.warn('Barcode scanner not supported:', error);
            return false;
            return false;
        }
    }

    /**
     * Check if we're running on a native platform (iOS/Android)
     */
    isNativePlatform(): boolean {
        return Capacitor.isNativePlatform();
    }

    /**
     * Get the current platform
     */
    getPlatform(): string {
        return Capacitor.getPlatform();
    }

    /**
     * Check camera permission status
     */
    async checkPermissions(): Promise<boolean> {
        try {
            const result = await BarcodeScanner.checkPermissions();
            return result.camera === 'granted';
        } catch (error) {
            console.warn('Failed to check permissions:', error);
            return false;
        }
    }

    /**
     * Request camera permissions
     */
    async requestPermissions(): Promise<boolean> {
        try {
            const result = await BarcodeScanner.requestPermissions();
            return result.camera === 'granted';
        } catch (error) {
            console.error('Failed to request permissions:', error);
            return false;
        }
    }

    /**
     * Get current scanner status
     */
    async getStatus(): Promise<ScannerStatus> {
        const isNative = this.isNativePlatform();

        if (!isNative) {
            return {
                isSupported: false,
                isAvailable: false,
                hasPermission: false,
                isScanning: this.isScanning,
            };
        }

        const [isSupported, hasPermission] = await Promise.all([
            this.isSupported(),
            this.checkPermissions(),
        ]);

        return {
            isSupported,
            isAvailable: isSupported,
            hasPermission,
            isScanning: this.isScanning,
        };
    }

    /**
     * Start continuous scanning with the camera
     * Uses the device camera viewfinder
     */
    async startScan(config?: ScannerConfig): Promise<void> {
        if (this.isScanning) {
            console.warn('Scanner is already running');
            return;
        }

        const hasPermission = await this.checkPermissions();
        if (!hasPermission) {
            const granted = await this.requestPermissions();
            if (!granted) {
                throw new Error('Camera permission denied');
            }
        }

        // Use lower resolution (640x480) for faster barcode detection
        // Higher resolution is not needed for 1D barcodes and slows down processing
        const options: StartScanOptions = {
            formats: config?.formats || DEFAULT_FORMATS,
            lensFacing: config?.lensFacing || LensFacing.Back,
            resolution: Resolution['640x480'],
        };

        try {
            this.isScanning = true;

            // Add listener for barcode scans (v7 API uses 'barcodesScanned')
            await BarcodeScanner.addListener('barcodesScanned', (event: BarcodesScannedEvent) => {
                if (event.barcodes && event.barcodes.length > 0) {
                    const barcode = event.barcodes[0];
                    const scanResult = this.transformBarcode(barcode);
                    this.notifyScanListeners(scanResult);
                }
            });

            // Start the scanner
            await BarcodeScanner.startScan(options);
        } catch (error) {
            this.isScanning = false;
            throw error;
        }
    }

    /**
     * Stop the camera scanner
     */
    async stopScan(): Promise<void> {
        if (!this.isScanning) {
            return;
        }

        try {
            await BarcodeScanner.stopScan();
            await BarcodeScanner.removeAllListeners();
            this.isScanning = false;
            this.torchState = false;
        } catch (error) {
            console.error('Error stopping scan:', error);
            this.isScanning = false;
            throw error;
        }
    }

    /**
     * Scan a single barcode using Google's optimized scanner UI
     * This method uses the native Google Barcode Scanner which is faster
     * and doesn't require WebView transparency handling
     */
    async scanOnce(config?: ScannerConfig): Promise<ScannerResult | null> {
        // Try to use Google Barcode Scanner for fastest experience
        if (this.isGoogleBarcodeScannerAvailable) {
            try {
                const scanOptions: ScanOptions = {
                    formats: config?.formats || DEFAULT_FORMATS,
                };
                const result = await BarcodeScanner.scan(scanOptions);

                if (result.barcodes && result.barcodes.length > 0) {
                    return this.transformBarcode(result.barcodes[0]);
                }
                return null;
            } catch (error) {
                console.warn('Google Barcode Scanner failed, falling back to standard scan:', error);
                // Fall through to standard method
            }
        }

        // Fallback: Use standard scanning with permission check
        const hasPermission = await this.checkPermissions();
        if (!hasPermission) {
            const granted = await this.requestPermissions();
            if (!granted) {
                throw new Error('Camera permission denied');
            }
        }

        // Use lower resolution for faster scanning
        const options: ScanOptions = {
            formats: config?.formats || DEFAULT_FORMATS,
        };

        try {
            const result = await BarcodeScanner.scan(options);

            if (result.barcodes && result.barcodes.length > 0) {
                return this.transformBarcode(result.barcodes[0]);
            }

            return null;
        } catch (error) {
            console.error('Scan error:', error);
            throw error;
        }
    }

    /**
     * Check if torch is available
     * Note: Torch control is not available in this version of the plugin
     */
    async isTorchAvailable(): Promise<boolean> {
        return false;
    }

    /**
     * Check if torch is enabled
     */
    async isTorchEnabled(): Promise<boolean> {
        return this.torchState;
    }

    /**
     * Toggle the flashlight/torch
     * Note: Torch control requires native implementation
     */
    async toggleTorch(): Promise<void> {
        // Torch control not available in v7 of @capacitor-mlkit/barcode-scanning
        // This would require a separate flashlight plugin
        console.warn('Torch control is not available in this version');
    }

    /**
     * Enable torch
     */
    async enableTorch(): Promise<void> {
        console.warn('Torch control is not available in this version');
    }

    /**
     * Disable torch
     */
    async disableTorch(): Promise<void> {
        console.warn('Torch control is not available in this version');
    }

    /**
     * Transform ML Kit barcode to our format
     */
    private transformBarcode(barcode: Barcode): ScannerResult {
        return {
            barcode: barcode.rawValue || '',
            format: this.getFormatName(barcode.format),
            rawValue: barcode.rawValue || '',
            displayValue: barcode.displayValue,
        };
    }

    /**
     * Get human-readable format name
     */
    private getFormatName(format: BarcodeFormat): string {
        const formatNames: Record<BarcodeFormat, string> = {
            [BarcodeFormat.Aztec]: 'AZTEC',
            [BarcodeFormat.Codabar]: 'CODABAR',
            [BarcodeFormat.Code39]: 'CODE39',
            [BarcodeFormat.Code93]: 'CODE93',
            [BarcodeFormat.Code128]: 'CODE128',
            [BarcodeFormat.DataMatrix]: 'DATA_MATRIX',
            [BarcodeFormat.Ean8]: 'EAN8',
            [BarcodeFormat.Ean13]: 'EAN13',
            [BarcodeFormat.Itf]: 'ITF',
            [BarcodeFormat.Pdf417]: 'PDF417',
            [BarcodeFormat.QrCode]: 'QR',
            [BarcodeFormat.UpcA]: 'UPC_A',
            [BarcodeFormat.UpcE]: 'UPC_E',
        };
        return formatNames[format] || 'UNKNOWN';
    }

    /**
     * Add a listener for scan results
     */
    addScanListener(callback: (result: ScannerResult) => void): () => void {
        this.scanListeners.push(callback);
        return () => {
            this.scanListeners = this.scanListeners.filter((l) => l !== callback);
        };
    }

    /**
     * Add a listener for errors
     */
    addErrorListener(callback: (error: Error) => void): () => void {
        this.errorListeners.push(callback);
        return () => {
            this.errorListeners = this.errorListeners.filter((l) => l !== callback);
        };
    }

    /**
     * Notify all scan listeners
     */
    private notifyScanListeners(result: ScannerResult): void {
        this.scanListeners.forEach((listener) => {
            try {
                listener(result);
            } catch (error) {
                console.error('Error in scan listener:', error);
            }
        });
    }

    /**
     * Notify all error listeners
     */
    private notifyErrorListeners(error: Error): void {
        this.errorListeners.forEach((listener) => {
            try {
                listener(error);
            } catch (e) {
                console.error('Error in error listener:', e);
            }
        });
    }

    /**
     * Get scanning state
     */
    isScannerActive(): boolean {
        return this.isScanning;
    }
}

// Export singleton instance
export const barcodeScannerService = new BarcodeScannerService();
export default barcodeScannerService;
