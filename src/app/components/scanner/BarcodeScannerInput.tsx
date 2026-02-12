/**
 * Barcode Scanner Input Component
 * A form input with integrated camera barcode scanning for mobile devices
 * Used in product/inventory creation forms
 */

import { FunctionComponent, useState, useRef, useCallback } from 'react';
import { BarcodeIcon } from 'lucide-react';
import FormInput from '../FormInput';
import CameraBarcodeScanner from './CameraBarcodeScanner';
import { type ScannerResult } from '../../services/barcode-scanner.service';
import { useScannerFeedback } from '../../hooks/useScannerSettings';

interface BarcodeScannerInputProps {
    /** Form field name */
    name: string;
    /** Input label */
    label: string;
    /** Placeholder text */
    placeholder?: string;
    /** Current value */
    value?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Callback when value changes */
    onChange?: (value: string) => void;
    /** Callback when barcode is scanned */
    onScan?: (barcode: string) => void;
    /** Additional class names */
    className?: string;
    /** Custom key down handler */
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    /** Scanner title */
    scannerTitle?: string;
    /** Scanner subtitle */
    scannerSubtitle?: string;
}

const BarcodeScannerInput: FunctionComponent<BarcodeScannerInputProps> = ({
    name,
    label,
    placeholder = 'Scan or enter barcode',
    value,
    required = false,
    disabled = false,
    onChange,
    onScan,
    className,
    onKeyDown,
    scannerTitle = 'Scan Barcode',
    scannerSubtitle = 'Point camera at product barcode',
}) => {
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { triggerFeedback } = useScannerFeedback();

    /**
     * Handle camera scan result
     */
    const handleScanResult = useCallback((result: ScannerResult) => {
        const scannedBarcode = result.barcode;

        // Trigger feedback (beep/vibration)
        triggerFeedback();

        // Update the value
        if (onChange) {
            onChange(scannedBarcode);
        }

        // Call onScan callback if provided
        if (onScan) {
            onScan(scannedBarcode);
        }

        // Close scanner
        setIsScannerOpen(false);

        // Focus the input
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    }, [onChange, onScan, triggerFeedback]);

    /**
     * Handle manual input change
     */
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        // Clean barcode (remove trailing $ from some scanners)
        const cleanedValue = newValue.endsWith('$') ? newValue.slice(0, -1) : newValue;

        if (onChange) {
            onChange(cleanedValue);
        }
    }, [onChange]);

    /**
     * Open the camera scanner
     */
    const handleOpenScanner = useCallback(() => {
        setIsScannerOpen(true);
    }, []);

    /**
     * Close the camera scanner
     */
    const handleCloseScanner = useCallback(() => {
        setIsScannerOpen(false);
        // Refocus input after closing
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className={`relative ${className || ''}`}>
            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <FormInput
                        ref={inputRef}
                        label={label}
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        required={required}
                        disabled={disabled}
                        onChange={handleInputChange}
                        onKeyDown={onKeyDown}
                    />
                </div>

                {/* Camera scan button - shows on all platforms, modal handles availability message */}
                {!disabled && (
                    <button
                        type="button"
                        onClick={handleOpenScanner}
                        className="mb-1 px-3 py-2.5 bg-sky-500 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                        title="Scan barcode with camera"
                        aria-label="Open camera barcode scanner"
                    >
                        <BarcodeIcon className="w-5 h-5" />
                        <span className="sr-only">Scan</span>
                    </button>
                )}
            </div>

            {/* Camera Scanner Modal */}
            <CameraBarcodeScanner
                isOpen={isScannerOpen}
                onClose={handleCloseScanner}
                onScan={handleScanResult}
                continuous={false}
                title={scannerTitle}
                subtitle={scannerSubtitle}
            />
        </div>
    );
};

export default BarcodeScannerInput;
