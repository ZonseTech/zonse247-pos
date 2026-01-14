/**
 * Scanner Mode Toggle Button
 * Allows switching between camera scanning and physical barcode scanner input
 */

import { FunctionComponent, useState, useCallback } from 'react';
import { HiOutlineCamera, HiOutlineQrcode } from 'react-icons/hi';
import { BsUpcScan } from 'react-icons/bs';
import { Capacitor } from '@capacitor/core';
import CameraBarcodeScanner from './CameraBarcodeScanner';
import { type ScannerResult } from '../../services/barcode-scanner.service';

export type ScannerMode = 'physical' | 'camera';

interface ScannerModeButtonProps {
    onScan: (barcode: string, format?: string) => void;
    onModeChange?: (mode: ScannerMode) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    continuous?: boolean;
    showLabel?: boolean;
    disabled?: boolean;
}

const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
};

const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

const ScannerModeButton: FunctionComponent<ScannerModeButtonProps> = ({
    onScan,
    onModeChange,
    className = '',
    size = 'md',
    continuous = false,
    showLabel = false,
    disabled = false,
}) => {
    const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
    const isNative = Capacitor.isNativePlatform();

    const handleOpenCamera = useCallback(() => {
        setIsCameraScannerOpen(true);
        onModeChange?.('camera');
    }, [onModeChange]);

    const handleCloseCamera = useCallback(() => {
        setIsCameraScannerOpen(false);
        onModeChange?.('physical');
    }, [onModeChange]);

    const handleCameraScan = useCallback(
        (result: ScannerResult) => {
            onScan(result.barcode, result.format);
        },
        [onScan]
    );

    // Show camera button on mobile devices
    if (!isNative) {
        return null; // Don't show on web/desktop
    }

    return (
        <>
            <button
                type="button"
                onClick={handleOpenCamera}
                disabled={disabled}
                className={`
                    inline-flex items-center justify-center gap-2
                    bg-purple-600 hover:bg-purple-700
                    text-white font-medium
                    rounded-lg transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${sizeClasses[size]}
                    ${className}
                `}
                title="Open camera scanner"
            >
                <HiOutlineCamera className={iconSizes[size]} />
                {showLabel && <span>Camera Scan</span>}
            </button>

            <CameraBarcodeScanner
                isOpen={isCameraScannerOpen}
                onClose={handleCloseCamera}
                onScan={handleCameraScan}
                continuous={continuous}
                title="Scan Barcode"
                subtitle="Point camera at product barcode"
            />
        </>
    );
};

/**
 * Combined scanner input with physical and camera support
 */
interface BarcodeScannerInputProps {
    value: string;
    onChange: (value: string) => void;
    onScan: (barcode: string, format?: string) => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    continuous?: boolean;
}

export const BarcodeScannerInput: FunctionComponent<BarcodeScannerInputProps> = ({
    value,
    onChange,
    onScan,
    placeholder = 'Scan or enter barcode...',
    className = '',
    inputClassName = '',
    autoFocus = false,
    disabled = false,
    continuous = false,
}) => {
    const isNative = Capacitor.isNativePlatform();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && value.trim()) {
            e.preventDefault();
            onScan(value.trim());
            onChange('');
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BsUpcScan className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    className={`
                        w-full pl-10 pr-4 py-2
                        border border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-800
                        text-gray-900 dark:text-gray-100
                        rounded-lg
                        focus:ring-2 focus:ring-purple-500 focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${inputClassName}
                    `}
                />
            </div>

            {isNative && (
                <ScannerModeButton
                    onScan={onScan}
                    disabled={disabled}
                    continuous={continuous}
                    size="md"
                />
            )}
        </div>
    );
};

export default ScannerModeButton;
