import { FunctionComponent } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { HiCash } from 'react-icons/hi';
import { BsBank2, BsCreditCard2Back } from 'react-icons/bs';
import { TbArrowsSplit } from 'react-icons/tb';

export type PaymentMode = 'cash' | 'e-pay' | 'bank' | 'split';

interface MobilePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onSelectPaymentMode: (mode: PaymentMode) => void;
}

interface PaymentTileProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color: string;
}

const MobilePaymentModal: FunctionComponent<MobilePaymentModalProps> = ({
    isOpen,
    onClose,
    total,
    onSelectPaymentMode,
}) => {
    if (!isOpen) return null;

    const handleSelectMode = (mode: PaymentMode) => {
        onSelectPaymentMode(mode);
    };

    return createPortal(
        <div className="fixed inset-0 z-[60] flex flex-col">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative mt-auto bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl animate-slide-up">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Select Payment Mode
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 pb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleSelectMode('cash')}
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 active:scale-95 transition-all"
                        >
                            <HiCash className="w-12 h-12 text-green-500 dark:text-green-400" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                CASH
                            </span>
                        </button>

                        <button
                            onClick={() => handleSelectMode('e-pay')}
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 active:scale-95 transition-all"
                        >
                            <BsCreditCard2Back className="w-12 h-12 text-sky-500 dark:text-sky-400" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                E-PAY
                            </span>
                        </button>

                        <button
                            onClick={() => handleSelectMode('bank')}
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 active:scale-95 transition-all"
                        >
                            <BsBank2 className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                BANK
                            </span>
                        </button>

                        <button
                            onClick={() => handleSelectMode('split')}
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 active:scale-95 transition-all"
                        >
                            <TbArrowsSplit className="w-12 h-12 text-amber-500 dark:text-amber-400" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                SPLIT PAYMENT
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MobilePaymentModal;
