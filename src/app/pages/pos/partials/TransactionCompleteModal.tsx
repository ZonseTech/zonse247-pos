import { Report } from 'notiflix';
import { FunctionComponent, useState, useEffect, useRef } from 'react';
import { CheckCircle, Printer, X, Receipt, ArrowRight } from 'lucide-react';
import { Button, Modal } from '../../../components';
import { useApp } from '../../../context/AppProvider';
import printerService from '../../../services/printer.service';
import { formatCurrency, formatDate } from '../../../utils';
import { Logo } from '../../../assets/images';
import { useIsEBN } from '../../../hooks/useMediaQuery';
import classNames from 'classnames';

type SaleOrTransaction = Transaction | Sale;

type TransactionCompleteModalProps = {
    isOpen: boolean;
    transaction: SaleOrTransaction | null;
    onClose: () => void;
    onNewTransaction: () => void;
};

// Helper functions to normalize field access between Sale and Transaction
const getTransactionId = (t: SaleOrTransaction): string =>
    (t as Transaction).transactionId || (t as Sale).id || t.id;

const getSaleId = (t: SaleOrTransaction): string =>
    (t as Transaction).saleId || (t as Transaction).id || (t as Sale).id || t.id;

const getRefNumber = (t: SaleOrTransaction): string =>
    (t as Transaction).refNumber || (t as Sale).saleNumber || 'N/A';

const getTotal = (t: SaleOrTransaction): number =>
    (t as Transaction).total ?? (t as Sale).totalAmount ?? 0;

const getPaid = (t: SaleOrTransaction): number =>
    (t as Transaction).paid ?? (t as Sale).amountPaid ?? 0;

const getDate = (t: SaleOrTransaction): string => {
    const date = (t as Transaction).date || (t as any).saleDate || (t as any).createdAt || new Date();
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    return new Date().toISOString();
};

const getTax = (t: SaleOrTransaction): number =>
    (t as Transaction).tax ?? (t as Sale).taxAmount ?? 0;

const getDiscount = (t: SaleOrTransaction): number =>
    (t as Transaction).discount ?? (t as Sale).discountAmount ?? 0;

const getSubtotal = (t: SaleOrTransaction): number =>
    (t as Transaction).subtotal ?? (t as Sale).subtotal ?? 0;

// Helper for items
type ItemType = CartItem | SaleItem;
const getItemName = (item: ItemType): string => {
    if ('name' in item && item.name) return item.name;
    if ('productDetails' in item && item.productDetails?.name) return item.productDetails.name;
    if ('product' in item && (item as SaleItem).product?.name) return (item as SaleItem).product!.name;
    return 'Unknown Product';
};
const getItemPrice = (item: ItemType): number => {
    if ('sellingPrice' in item) return item.sellingPrice;
    if ('unitPrice' in item) return item.unitPrice;
    return 0;
};

// Helper for payments
const getPayments = (t: SaleOrTransaction): SalePayment[] | undefined => {
    return (t as Transaction).payments || (t as Sale).payments;
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
    const isEBN = useIsEBN();
    const hasAutoPrinted = useRef<string | null>(null);

    useEffect(() => {
        const autoPrintReceipt = async () => {
            if (!isOpen || !transaction || isPrinting) return;

            if (!settings?.autoPrintReceipt) return;

            const saleId = getSaleId(transaction);

            if (hasAutoPrinted.current === saleId) return;

            try {
                setIsPrinting(true);
                hasAutoPrinted.current = saleId;

                await printerService.printReceipt({
                    saleId: saleId,
                    transactionId: getTransactionId(transaction),
                    copies: settings?.receiptCopies || 1,
                    includeHeader: true,
                    includeFooter: true,
                    includeLogo: settings?.showStoreLogo || false,
                });

                console.log('Receipt auto-printed successfully for sale:', saleId);
            } catch (error) {
                console.error('Auto-print failed:', error);
            } finally {
                setIsPrinting(false);
            }
        };

        autoPrintReceipt();
    }, [isOpen, transaction, settings?.autoPrintReceipt]);

    // Reset auto-print flag when modal closes
    useEffect(() => {
        if (!isOpen) {
            hasAutoPrinted.current = null;
        }
    }, [isOpen]);

    if (!isOpen || !transaction) return null;

    const handlePrintReceipt = async () => {
        try {
            setIsPrinting(true);

            await printerService.printReceipt({
                saleId: getSaleId(transaction),
                transactionId: getTransactionId(transaction),
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
    const payments = getPayments(transaction);
    const hasMultiplePayments = payments && payments.length > 1;
    const paymentMethodLabel = hasMultiplePayments
        ? 'Split Payment'
        : transaction.paymentMethodId === 'cash'
            ? 'Cash'
            : transaction.paymentMethodId === 'mobile-money'
                ? 'Mobile Money'
                : transaction.paymentMethodId === 'bank-transfer'
                    ? 'Bank Transfer'
                    : transaction.paymentMethodId === 'multiple'
                        ? 'Split Payment'
                        : 'Card';

    const getPaymentMethodLabel = (methodId: string) => {
        switch (methodId) {
            case 'cash':
                return 'Cash';
            case 'mobile-money':
                return 'Mobile Money';
            case 'bank-transfer':
                return 'Bank Transfer';
            case 'card':
                return 'Card';
            default:
                return methodId;
        }
    };

    return (
        <Modal
            title=""
            isOpen={isOpen}
            showCloseButton={false}
            onClose={onClose}
            className={isEBN ? "max-w-xl max-h-[98vh]" : "max-w-2xl"}
            overlayClassName="z-[70]"
        >
            <div className={isEBN ? "p-3" : "p-6"}>
                {/* Success Header */}
                <div className={classNames("text-center", isEBN ? "mb-3" : "mb-8")}>
                    <div className={classNames("flex justify-center", isEBN ? "mb-2" : "mb-4")}>
                        <div className={classNames(
                            "bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-bounce-once",
                            isEBN ? "w-12 h-12" : "w-20 h-20"
                        )}>
                            <CheckCircle className={isEBN ? "w-7 h-7 text-green-500" : "w-12 h-12 text-green-500"} />
                        </div>
                    </div>
                    <h2 className={classNames(
                        "font-bold text-gray-900 dark:text-white",
                        isEBN ? "text-lg mb-1" : "text-2xl mb-2"
                    )}>
                        Transaction Complete!
                    </h2>
                    <p className={classNames(
                        "text-gray-600 dark:text-gray-400",
                        isEBN && "text-xs"
                    )}>
                        Payment has been processed successfully
                    </p>
                </div>

                {/* Transaction Summary Card */}
                <div className={classNames(
                    "bg-gradient-to-br from-gray-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600",
                    isEBN ? "p-3 mb-3" : "p-6 mb-6"
                )}>
                    <div className={classNames("flex items-center justify-between", isEBN ? "mb-2" : "mb-4")}>
                        <span className={classNames(
                            "font-medium text-gray-500 dark:text-gray-400",
                            isEBN ? "text-xs" : "text-sm"
                        )}>Reference #</span>
                        <span className={classNames(
                            "font-mono bg-white dark:bg-gray-600 px-3 py-1 rounded-lg shadow-sm",
                            isEBN ? "text-xs" : "text-sm"
                        )}>
                            {getRefNumber(transaction)}
                        </span>
                    </div>

                    <div className={classNames("grid grid-cols-2", isEBN ? "gap-2 mb-2" : "gap-4 mb-4")}>
                        <div className={classNames(
                            "bg-white dark:bg-gray-600 rounded-lg shadow-sm",
                            isEBN ? "p-2" : "p-4"
                        )}>
                            <p className={classNames(
                                "text-gray-500 dark:text-gray-400",
                                isEBN ? "text-[10px] mb-0.5" : "text-xs mb-1"
                            )}>Total Amount</p>
                            <p className={classNames(
                                "font-bold text-gray-900 dark:text-white",
                                isEBN ? "text-sm" : "text-xl"
                            )}>
                                {formatCurrency(getTotal(transaction))}
                            </p>
                        </div>
                        <div className={classNames(
                            "bg-white dark:bg-gray-600 rounded-lg shadow-sm",
                            isEBN ? "p-2" : "p-4"
                        )}>
                            <p className={classNames(
                                "text-gray-500 dark:text-gray-400",
                                isEBN ? "text-[10px] mb-0.5" : "text-xs mb-1"
                            )}>Amount Paid</p>
                            <p className={classNames(
                                "font-bold text-green-500 dark:text-green-400",
                                isEBN ? "text-sm" : "text-xl"
                            )}>
                                {formatCurrency(getPaid(transaction))}
                            </p>
                        </div>
                    </div>

                    {/* Discount Display */}
                    {getDiscount(transaction) > 0 && (
                        <div className={classNames(
                            "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg",
                            isEBN ? "p-2 mb-2" : "p-3 mb-4"
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={isEBN ? "text-sm" : "text-lg"}>🏷️</span>
                                    <div>
                                        <span className={classNames(
                                            "font-medium text-green-800 dark:text-green-200",
                                            isEBN ? "text-xs" : "text-sm"
                                        )}>Discount Applied</span>
                                        {getSubtotal(transaction) > 0 && (
                                            <p className={classNames(
                                                "text-green-500 dark:text-green-400",
                                                isEBN ? "text-[10px]" : "text-xs"
                                            )}>
                                                Subtotal: {formatCurrency(getSubtotal(transaction))}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <span className={classNames(
                                    "font-bold text-green-700 dark:text-green-300",
                                    isEBN ? "text-sm" : "text-lg"
                                )}>
                                    -{formatCurrency(getDiscount(transaction))}
                                </span>
                            </div>
                        </div>
                    )}

                    {change > 0 && (
                        <div className={classNames(
                            "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg",
                            isEBN ? "p-2 mb-2" : "p-4 mb-4"
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={isEBN ? "text-lg" : "text-2xl"}>💰</span>
                                    <span className={classNames(
                                        "font-medium text-yellow-800 dark:text-yellow-200",
                                        isEBN && "text-sm"
                                    )}>Change Due</span>
                                </div>
                                <span className={classNames(
                                    "font-bold text-yellow-700 dark:text-yellow-300",
                                    isEBN ? "text-lg" : "text-2xl"
                                )}>
                                    {formatCurrency(change)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className={classNames("flex items-center justify-between", isEBN ? "text-xs" : "text-sm")}>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span>Payment Method:</span>
                            <span className={classNames(
                                "bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-2 py-1 rounded-full font-medium",
                                isEBN ? "text-[10px]" : "text-xs"
                            )}>
                                {paymentMethodLabel}
                            </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                            {formatDate(getDate(transaction))}
                        </div>
                    </div>

                    {/* Multiple Payments Breakdown */}
                    {hasMultiplePayments && payments && (
                        <div className={classNames(
                            "mt-4 border-t border-gray-200 dark:border-gray-600 pt-4",
                        )}>
                            <p className={classNames(
                                "font-semibold text-gray-700 dark:text-gray-300 mb-2",
                                isEBN ? "text-xs" : "text-sm"
                            )}>Payment Breakdown:</p>
                            <div className="space-y-2">
                                {payments.map((payment, index) => (
                                    <div
                                        key={payment.id || index}
                                        className={classNames(
                                            "flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg",
                                            isEBN ? "px-2 py-1.5" : "px-3 py-2"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={classNames(
                                                "bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-2 py-0.5 rounded-full font-medium",
                                                isEBN ? "text-[10px]" : "text-xs"
                                            )}>
                                                {getPaymentMethodLabel(payment.paymentMethodId)}
                                            </span>
                                            {payment.reference && (
                                                <span className={classNames(
                                                    "text-gray-500 dark:text-gray-400",
                                                    isEBN ? "text-[10px]" : "text-xs"
                                                )}>
                                                    Ref: {payment.reference}
                                                </span>
                                            )}
                                        </div>
                                        <span className={classNames(
                                            "font-mono font-semibold text-gray-900 dark:text-white",
                                            isEBN ? "text-xs" : "text-sm"
                                        )}>
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Items Summary */}
                <div className={classNames(
                    "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden",
                    isEBN ? "mb-3" : "mb-6"
                )}>
                    <div className={classNames(
                        "bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600",
                        isEBN ? "px-3 py-2" : "px-4 py-3"
                    )}>
                        <h3 className={classNames(
                            "font-semibold text-gray-900 dark:text-white flex items-center gap-2",
                            isEBN && "text-sm"
                        )}>
                            <Receipt className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
                            Items ({transaction.items?.length || 0})
                        </h3>
                    </div>
                    <div className={isEBN ? "max-h-24 overflow-y-auto" : "max-h-40 overflow-y-auto"}>
                        {transaction.items?.map((item, index) => (
                            <div
                                key={index}
                                className={classNames(
                                    "flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0",
                                    isEBN ? "px-3 py-1.5" : "px-4 py-3"
                                )}
                            >
                                <div className="flex-1">
                                    <p className={classNames(
                                        "font-medium text-gray-900 dark:text-white",
                                        isEBN ? "text-xs" : "text-sm"
                                    )}>
                                        {item.name}
                                    </p>
                                    <p className={classNames(
                                        "text-gray-500 dark:text-gray-400",
                                        isEBN ? "text-[10px]" : "text-xs"
                                    )}>
                                        {item.quantity} × {formatCurrency(item.sellingPrice)}
                                    </p>
                                </div>
                                <span className={classNames(
                                    "font-mono font-semibold text-gray-900 dark:text-white",
                                    isEBN && "text-xs"
                                )}>
                                    {formatCurrency(item.sellingPrice * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={isEBN ? "space-y-2" : "space-y-3"}>
                    <Button
                        theme="success"
                        className={classNames(
                            "w-full font-semibold flex items-center justify-center",
                            isEBN ? "py-2 text-sm gap-2" : "py-4 text-lg gap-3"
                        )}
                        onClick={handlePrintReceipt}
                        disabled={isPrinting}
                    >
                        {isPrinting ? (
                            <>
                                <div className={classNames(
                                    "animate-spin rounded-full border-b-2 border-white",
                                    isEBN ? "h-4 w-4" : "h-5 w-5"
                                )}></div>
                                <span>Printing...</span>
                            </>
                        ) : (
                            <>
                                <Printer className={isEBN ? "w-4 h-4" : "w-5 h-5"} />
                                <span>Reprint Receipt</span>
                            </>
                        )}
                    </Button>

                    <div className={isEBN ? "flex gap-2" : "flex gap-3"}>
                        <Button
                            theme="warning"
                            className={classNames(
                                "flex-1 flex items-center justify-center gap-2",
                                isEBN ? "py-2 text-xs" : "py-3"
                            )}
                            onClick={handleViewReceipt}
                        >
                            <Receipt className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
                            <span>Preview Receipt</span>
                        </Button>
                        <Button
                            theme="primary"
                            className={classNames(
                                "flex-1 flex items-center justify-center gap-2",
                                isEBN ? "py-2 text-xs" : "py-3"
                            )}
                            onClick={handleSkipPrint}
                        >
                            <span>New Transaction</span>
                            <ArrowRight className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Receipt Preview Modal */}
            {showReceiptPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full flex flex-col max-h-[90vh] shadow-2xl">
                        {/* Fixed Header */}
                        <div className="flex-shrink-0 bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between rounded-t-xl">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Receipt Preview</h3>
                            <button
                                onClick={() => setShowReceiptPreview(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Receipt Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
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
                                    <span className="font-mono">{getRefNumber(transaction)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                    <span>{formatDate(getDate(transaction))}</span>
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
                                            <span>{getItemName(item)}</span>
                                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        <span className="font-mono">
                                            {formatCurrency(getItemPrice(item) * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-4"></div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-mono">{formatCurrency(getSubtotal(transaction))}</span>
                                </div>
                                {getTax(transaction) > 0 && (
                                    <div className="flex justify-between">
                                        <span>Tax:</span>
                                        <span className="font-mono">{formatCurrency(getTax(transaction))}</span>
                                    </div>
                                )}
                                {getDiscount(transaction) > 0 && (
                                    <div className="flex justify-between text-green-500 dark:text-green-400">
                                        <span>Discount:</span>
                                        <span className="font-mono">-{formatCurrency(getDiscount(transaction))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <span>Total:</span>
                                    <span className="font-mono">{formatCurrency(getTotal(transaction))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Paid:</span>
                                    <span className="font-mono">{formatCurrency(getPaid(transaction))}</span>
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

                        <div className="flex-shrink-0 bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-600 rounded-b-xl">
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
