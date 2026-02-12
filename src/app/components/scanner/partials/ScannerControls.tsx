import { Camera, Scan, Flashlight, RotateCcw, Maximize2 } from 'lucide-react';
import { FunctionComponent } from 'react';

type ScanMode = 'camera' | 'barcode';

interface ScannerControlsProps {
    activeMode: ScanMode;
    onModeChange: (mode: ScanMode) => void;
    torchAvailable: boolean;
    torchEnabled: boolean;
    onToggleTorch: () => void;
    onRotateCamera: () => void;
    isLoading: boolean;
    isScanning: boolean;
}

const ScannerControls: FunctionComponent<ScannerControlsProps> = ({
    activeMode,
    onModeChange,
    torchAvailable,
    torchEnabled,
    onToggleTorch,
    onRotateCamera,
    isLoading,
    isScanning,
}) => {
    return (
        <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onModeChange('camera')}
                    className={`p-3 rounded-sm transition-all duration-300 ${activeMode === 'camera'
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    <Camera className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onModeChange('barcode')}
                    className={`p-3 rounded-sm transition-all duration-300 ${activeMode === 'barcode'
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    <Scan className="w-5 h-5" />
                </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
                {torchAvailable && (
                    <button
                        onClick={onToggleTorch}
                        disabled={isLoading || !isScanning}
                        className={`p-3 rounded-sm transition-all duration-300 disabled:opacity-50 ${torchEnabled
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Flashlight className="w-5 h-5" />
                    </button>
                )}
                <button
                    onClick={onRotateCamera}
                    className="p-3 rounded-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300">
                    <Maximize2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default ScannerControls;
