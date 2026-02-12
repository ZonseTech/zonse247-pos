import { Scan } from 'lucide-react';
import { FunctionComponent } from 'react';
import { BsUpcScan } from 'react-icons/bs';
import { HiRefresh } from 'react-icons/hi';

interface CameraViewProps {
    isScannerUnavailable: boolean;
    isNative: boolean;
    isScanning: boolean;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}

const CameraView: FunctionComponent<CameraViewProps> = ({
    isScannerUnavailable,
    isNative,
    isScanning,
    isLoading,
    error,
    onRetry,
}) => {
    return (
        <div className="relative aspect-[4/3] bg-white rounded-sm overflow-hidden border border-gray-200">
            {/* Camera Feed Placeholder */}
            <div className="absolute inset-0 bg-gray-100" />

            {/* Grid Overlay */}
            <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full grid grid-cols-12 grid-rows-12">
                    {[...Array(144)].map((_, i) => (
                        <div key={i} className="border border-sky-500/30" />
                    ))}
                </div>
            </div>

            {/* Unsupported Message for Web/Desktop */}
            {isScannerUnavailable ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white">
                    <div className="w-20 h-20 mb-4 rounded-sm bg-sky-50 border border-sky-200 flex items-center justify-center">
                        <BsUpcScan className="w-10 h-10 text-sky-500" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2 text-center">
                        Camera Scanner Not Available
                    </h2>
                    <p className="text-gray-500 text-center text-sm max-w-xs">
                        {isNative
                            ? 'Camera barcode scanning is not supported on this device.'
                            : 'Camera scanning is only available on mobile devices. Use a physical barcode scanner or manual item lookup.'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Scanner Frame with L-shaped Corners */}
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                        <div className="relative w-full h-full max-w-sm">
                            {/* Top-Left Corner */}
                            <div className="absolute top-0 left-0 w-12 h-12 corner-animate">
                                <div className="absolute top-0 left-0 w-full h-1 bg-sky-500" />
                                <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
                            </div>

                            {/* Top-Right Corner */}
                            <div className="absolute top-0 right-0 w-12 h-12 corner-animate">
                                <div className="absolute top-0 right-0 w-full h-1 bg-sky-500" />
                                <div className="absolute top-0 right-0 w-1 h-full bg-sky-500" />
                            </div>

                            {/* Bottom-Left Corner */}
                            <div className="absolute bottom-0 left-0 w-12 h-12 corner-animate">
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500" />
                                <div className="absolute bottom-0 left-0 w-1 h-full bg-sky-500" />
                            </div>

                            {/* Bottom-Right Corner */}
                            <div className="absolute bottom-0 right-0 w-12 h-12 corner-animate">
                                <div className="absolute bottom-0 right-0 w-full h-1 bg-sky-500" />
                                <div className="absolute bottom-0 right-0 w-1 h-full bg-sky-500" />
                            </div>

                            {/* Scanning Line */}
                            {isScanning && !isLoading && (
                                <div className="absolute inset-x-0 top-0 h-1">
                                    <div className="scan-line w-full h-full bg-sky-500 opacity-75" />
                                </div>
                            )}

                            {/* Center Guide */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Scan className="w-16 h-16 text-sky-500/30" />
                            </div>
                        </div>
                    </div>

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <div className="bg-red-500/90 backdrop-blur-sm rounded-sm p-4 text-center max-w-xs">
                                <p className="text-white text-sm mb-3">{error}</p>
                                <button
                                    onClick={onRetry}
                                    className="px-4 py-2 bg-white text-red-500 rounded-sm text-sm font-semibold flex items-center justify-center mx-auto gap-2 hover:bg-red-50 transition-colors"
                                >
                                    <HiRefresh className="w-4 h-4" />
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Status Indicator */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-sky-500/30">
                        <div className={`w-2 h-2 rounded-full ${isScanning && !isLoading ? 'bg-sky-500 animate-pulse' : 'bg-gray-500'}`} />
                        <span className="text-xs font-semibold text-sky-400 mono">
                            {isLoading ? 'STARTING...' : isScanning ? 'SCANNING...' : 'INACTIVE'}
                        </span>
                    </div>

                    {/* Instructions */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                        <p className="text-sm text-gray-400 font-light">Position barcode within frame</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default CameraView;
