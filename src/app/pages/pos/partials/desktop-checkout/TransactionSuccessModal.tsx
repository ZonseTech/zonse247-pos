import { FunctionComponent, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../../../../utils';

interface TransactionSuccessModalProps {
    isOpen: boolean;
    total: number;
    changeAmount: number;
    refNumber: string;
    onComplete: () => void;
    autoCloseDelay?: number;
    loyaltyPointsEarned?: number;
}

const TransactionSuccessModal: FunctionComponent<TransactionSuccessModalProps> = ({
    isOpen,
    total,
    changeAmount,
    refNumber,
    onComplete,
    autoCloseDelay = 3000,
    loyaltyPointsEarned,
}) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onComplete();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [isOpen, onComplete, autoCloseDelay]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">
                <div className="flex flex-col items-center pt-8 pb-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center animate-ping-slow absolute inset-0" />

                        <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center relative shadow-lg shadow-emerald-500/30">
                            <svg
                                className="w-12 h-12 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path
                                    d="M5 13l4 4L19 7"
                                    className="animate-draw-check"
                                    style={{
                                        strokeDasharray: 24,
                                        strokeDashoffset: 24,
                                        animation: 'draw-check 0.5s ease-out 0.2s forwards',
                                    }}
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="text-center px-6 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Transaction Complete!
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Sale processed successfully
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Reference</span>
                            <span className="font-mono font-semibold text-gray-900 dark:text-white">
                                {refNumber}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(total)}
                            </span>
                        </div>
                        {changeAmount > 0 && (
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                                <span className="text-gray-600 dark:text-gray-400">Change</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                                    {formatCurrency(changeAmount)}
                                </span>
                            </div>
                        )}
                        {loyaltyPointsEarned != null && loyaltyPointsEarned > 0 && (
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                                <span className="text-gray-600 dark:text-gray-400">Points Earned</span>
                                <span className="font-bold text-sky-600 dark:text-sky-400">
                                    +{loyaltyPointsEarned.toLocaleString()} pts
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                                animation: `shrink-width ${autoCloseDelay}ms linear forwards`,
                            }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes draw-check {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
                
                @keyframes scale-in {
                    0% {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes ping-slow {
                    0% {
                        transform: scale(1);
                        opacity: 0.5;
                    }
                    75%, 100% {
                        transform: scale(1.3);
                        opacity: 0;
                    }
                }
                
                @keyframes shrink-width {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
                
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out forwards;
                }
                
                .animate-ping-slow {
                    animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>,
        document.body
    );
};

export default TransactionSuccessModal;
