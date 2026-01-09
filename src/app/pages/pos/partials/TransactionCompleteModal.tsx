import { Report } from 'notiflix';
import { FunctionComponent, useState } from 'react';
import { CheckCircle, Printer, X, Receipt, ArrowRight } from 'lucide-react';
import { Button, Modal } from '../../../components';
import { useApp } from '../../../context/AppProvider';
import printerService from '../../../services/printer.service';
import { formatCurrency, formatDate } from '../../../utils';
import { Logo } from '../../../assets/images';

type TransactionCompleteModalProps = {
    isOpen: boolean;
    transaction: Transaction | null;
    onClose: () => void;
    onNewTransaction: () => void;
};

const TransactionCompleteModal: FunctionComponent<TransactionCompleteModalProps> = ({
    isOpen,
    transaction,
    onClose,
    onNewTransaction,
}) => {
    const [isPrinting, setIsPrinting] = useState<boolean>(false);
    const [showReceiptPreview, setShowReceiptPreview] = useState<boolean>(false);
    const { settings } = useApp();

    if (!isOpen || !transaction) return null;

    const handlePrintReceipt = async () => {
        try {
            setIsPrinting(true);

            await printerService.printReceipt({
                transactionId: transaction.transactionId,
                copies: settings?.receiptCopies || 1,
                includeHeader: true,
                includeFooter: true,
                includeLogo: settings?.showStoreLogo || false,
            });

            Report.success(
                'Print Successful',
                'Your receipt has been printed successfully',
                'Continue',
                () => {
                    onNewTransaction();
                }
            );
        } catch (error) {
            Report.failure(
                'Print Failed',
                'Unable to print receipt. Please check your printer connection.',
                'Retry'
            );
        } finally {
            setIsPrinting(false);
        }
    };

    const handleSkipPrint = () => {
        onNewTransaction();
    };

    const handleViewReceipt = () => {
        setShowReceiptPreview(true);
    };

    const change = transaction.changeAmount || 0;
    const paymentMethodLabel = transaction.paymentMethodId === 'cash'
        ? 'Cash'
        : transaction.paymentMethodId === 'mobile-money'
            ? 'Mobile Money'
            : transaction.paymentMethodId === 'bank-transfer'
                ? 'Bank Transfer'
                : 'Card';

    return (
        <Modal
            title=""
            isOpen={isOpen}
            showCloseButton={false}
            onClose={onClose}
            className="max-w-2xl"
        >
            <div className="p-6">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-bounce-once">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Transaction Complete!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Payment has been processed successfully
                    </p>
                </div>

                {/* Transaction Summary Card */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference #</span>
                        <span className="font-mono text-sm bg-white dark:bg-gray-600 px-3 py-1 rounded-lg shadow-sm">
                            {transaction.refNumber}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white dark:bg-gray-600 rounded-lg p-4 shadow-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(transaction.total)}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-600 rounded-lg p-4 shadow-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount Paid</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(transaction.paid)}
                            </p>
                        </div>
                    </div>

                    {change > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">💰</span>
                                    <span className="font-medium text-yellow-800 dark:text-yellow-200">Change Due</span>
                                </div>
                                <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                                    {formatCurrency(change)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span>Payment Method:</span>
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                                {paymentMethodLabel}
                            </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                            {formatDate(transaction.date)}
                        </div>
                    </div>
                </div>

                {/* Items Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 mb-6 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            Items ({transaction.items?.length || 0})
                        </h3>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                        {transaction.items?.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.quantity} × {formatCurrency(item.sellPrice)}
                                    </p>
                                </div>
                                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(item.sellPrice * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        theme="success"
                        className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-3"
                        onClick={handlePrintReceipt}
                        disabled={isPrinting}
                    >
                        {isPrinting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Printing...</span>
                            </>
                        ) : (
                            <>
                                <Printer className="w-5 h-5" />
                                <span>Print Receipt</span>
                            </>
                        )}
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            theme="neutral"
                            className="flex-1 py-3 flex items-center justify-center gap-2"
                            onClick={handleViewReceipt}
                        >
                            <Receipt className="w-4 h-4" />
                            <span>Preview Receipt</span>
                        </Button>
                        <Button
                            theme="primary"
                            className="flex-1 py-3 flex items-center justify-center gap-2"
                            onClick={handleSkipPrint}
                        >
                            <span>New Transaction</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Receipt Preview Modal */}
            {showReceiptPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Receipt Preview</h3>
                            <button
                                onClick={() => setShowReceiptPreview(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Receipt Content */}
                        <div className="p-6 bg-white dark:bg-gray-800">
                            <div className="text-center mb-6">
                                <div className="flex justify-center mb-3">
                                    <img
                                        alt={settings?.storeName}
                                        src={Logo}
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {settings?.storeName || 'Store Name'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {settings?.storeAddress}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Tel: {settings?.storePhone}
                                </p>
                            </div>

                            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-4"></div>

                            <div className="text-sm space-y-1 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Ref:</span>
                                    <span className="font-mono">{transaction.refNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                    <span>{formatDate(transaction.date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Cashier:</span>
                                    <span>{transaction.user?.fullname || 'Staff'}</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-4"></div>

                            <div className="space-y-2 mb-4">
                                {transaction.items?.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <div className="flex-1">
                                            <span>{item.name}</span>
                                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        <span className="font-mono">
                                            {formatCurrency(item.sellPrice * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-4"></div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-mono">{formatCurrency(transaction.subtotal)}</span>
                                </div>
                                {transaction.tax > 0 && (
                                    <div className="flex justify-between">
                                        <span>Tax:</span>
                                        <span className="font-mono">{formatCurrency(transaction.tax)}</span>
                                    </div>
                                )}
                                {transaction.discount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span>Discount:</span>
                                        <span className="font-mono">-{formatCurrency(transaction.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <span>Total:</span>
                                    <span className="font-mono">{formatCurrency(transaction.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Paid:</span>
                                    <span className="font-mono">{formatCurrency(transaction.paid)}</span>
                                </div>
                                {change > 0 && (
                                    <div className="flex justify-between font-semibold text-yellow-600 dark:text-yellow-400">
                                        <span>Change:</span>
                                        <span className="font-mono">{formatCurrency(change)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-4"></div>

                            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                <p>{settings?.receiptFooter || 'Thank you for your business!'}</p>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
                            <Button
                                theme="success"
                                className="w-full py-3 flex items-center justify-center gap-2"
                                onClick={() => {
                                    setShowReceiptPreview(false);
                                    handlePrintReceipt();
                                }}
                                disabled={isPrinting}
                            >
                                <Printer className="w-4 h-4" />
                                <span>Print This Receipt</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default TransactionCompleteModal;
