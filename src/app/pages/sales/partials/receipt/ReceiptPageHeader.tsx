import { FunctionComponent } from 'react';
import { Share2, Download, Printer, MoreVertical, Copy, RotateCcw } from 'lucide-react';
import MobilePageHeader from '../../../../components/page/MobilePageHeader';

interface ReceiptPageHeaderProps {
    refNumber: string;
    copied: boolean;
    isPrinting: boolean;
    isMoreMenuOpen: boolean;
    canReturn: boolean;
    isFullyRefunded: boolean;
    onBack: () => void;
    onCopyRef: () => void;
    onShare: () => void;
    onDownload: () => void;
    onPrint: () => void;
    onToggleMenu: () => void;
    onInitiateReturn: () => void;
}

const ReceiptPageHeader: FunctionComponent<ReceiptPageHeaderProps> = ({
    refNumber,
    copied,
    isPrinting,
    isMoreMenuOpen,
    canReturn,
    isFullyRefunded,
    onBack,
    onCopyRef,
    onShare,
    onDownload,
    onPrint,
    onToggleMenu,
    onInitiateReturn,
}) => {
    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            <MobilePageHeader
                title="Receipt"
                onLeftPress={onBack}
                className="bg-white dark:bg-gray-800"
                rightContent={
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onShare}
                            className="p-2 rounded-sm active:scale-95 transition-all"
                            aria-label="Share receipt"
                        >
                            <Share2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </button>
                        <button
                            onClick={onDownload}
                            className="p-2 rounded-sm active:scale-95 transition-all"
                            aria-label="Download receipt"
                        >
                            <Download className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </button>
                        <button
                            onClick={onPrint}
                            disabled={isPrinting}
                            className="p-2 rounded-sm active:scale-95 transition-all disabled:opacity-50"
                            aria-label="Print receipt"
                        >
                            <Printer className={`w-5 h-5 ${isPrinting ? 'text-sky-500 animate-pulse' : 'text-sky-600 dark:text-sky-400'}`} />
                        </button>
                        <div className="relative">
                            <button
                                onClick={onToggleMenu}
                                className="p-2 rounded-sm active:scale-95 transition-all"
                                aria-label="More options"
                            >
                                <MoreVertical className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                            </button>

                            {isMoreMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={onToggleMenu}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-sm shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                                        {canReturn && !isFullyRefunded && (
                                            <button
                                                onClick={onInitiateReturn}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <RotateCcw className="w-4 h-4 text-sky-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Initiate Return</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={onCopyRef}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Copy className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Copy Reference</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                }
            />
        </div>
    );
};

export default ReceiptPageHeader;
