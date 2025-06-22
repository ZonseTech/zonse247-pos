import { Report } from 'notiflix';
import { type FunctionComponent, useState } from 'react';
import { Logo } from '../../../assets/images';
import { Button, Modal, ModalFooter } from '../../../components';
import { useApp } from '../../../context/AppProvider';
import printerService from '../../../services/printer.service';
import { formatCurrency, formatDate } from '../../../utils';

type Props = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    setIsPaymentModalOpen: (isOpen: boolean) => void;
    title?: string;
    transaction: Transaction;
};

const PrinterPreviewModal: FunctionComponent<Props> = ({
    isOpen,
    setIsOpen,
    setIsPaymentModalOpen,
    title = "Receipt Preview",
    transaction,
}) => {
    if (!isOpen) return null;

    const [isPrinting, setIsPrinting] = useState<boolean>(false);
    const { settings, printerOptions } = useApp();

    const handlePrintReceipt = async () => {
        try {
            setIsPrinting(true);
            await printerService.print({
                transaction,
                options: {
                    ...printerOptions,
                },
                settings,
            });

            Report.success(
                'Print Successful',
                'Your receipt has been printed successfully',
                'Continue',
                handleCancelPayment
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

    const handleCancelPayment = () => {
        setIsOpen(false);
        setIsPaymentModalOpen(false);
    };

    return (
        <Modal
            title={''}
            isOpen={isOpen}
            showCloseButton={false}
            onClose={handleCancelPayment}
            header={(
                <div className="flex justify-between items-center px-0 py-4 pb-8 border-b border-gray-100 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                            <p className="text-sm text-gray-500">Transaction #{transaction.refNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button
                            disabled={isPrinting}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            onClick={handlePrintReceipt}
                        >
                            {isPrinting ? (
                                <div className="flex items-center space-x-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Printing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    <span>Print Receipt</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            )}
            className='max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden'
        >
            <div className="max-h-[70vh] overflow-y-auto">
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 p-8">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl p-3 shadow-lg">
                                    <img
                                        alt={settings?.store}
                                        src={Logo}
                                        className="w-full h-full object-contain rounded-lg"
                                    />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            {settings?.store || 'Store Name'}
                        </h2>
                        <div className="text-gray-600 dark:text-gray-300 space-y-1">
                            <p className="font-medium">{settings?.addressLine1}</p>
                            <p>{settings?.addressLine2}</p>
                            <p className="flex items-center justify-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{settings?.contact}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center mb-8">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
                        <div className="px-4">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Transaction Details
                        </h3>
                        <div className="grid grid-cols-1 gap-3 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Reference</span>
                                <span className="text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">{transaction.refNumber}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Customer</span>
                                <span className="text-gray-900 dark:text-white">{transaction?.customer?.name as string || 'Walk-in Customer'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Cashier</span>
                                <span className="text-gray-900 dark:text-white">{transaction?.user?.fullname}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Date & Time</span>
                                <span className="text-gray-900 dark:text-white">{formatDate(transaction.date)}</span>
                            </div>
                            {transaction.phoneNumber && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Phone</span>
                                    <span className="text-gray-900 dark:text-white">{transaction.phoneNumber}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Till</span>
                                <span className="text-gray-900 dark:text-white font-semibold">{transaction.workstation.tillName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Items Purchased
                        </h3>

                        <div className="overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-gray-50 dark:bg-gray-600 rounded-lg mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <div className="col-span-6">Item</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-center">Price</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>

                            {Array.isArray(transaction.items) && transaction.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 py-3 px-4 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                    <div className="col-span-6 font-medium">{item.name}</div>
                                    <div className="col-span-2 text-center">
                                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-center font-mono">{formatCurrency(item.sellPrice)}</div>
                                    <div className="col-span-2 text-right font-mono font-semibold">{formatCurrency(item.sellPrice * item.quantity)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Payment Summary
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 text-gray-700 dark:text-gray-300">
                                <span>Subtotal</span>
                                <span className="font-mono">{formatCurrency(transaction.subtotal)}</span>
                            </div>

                            {transaction.tax > 0 && (
                                <div className="flex justify-between items-center py-2 text-gray-700 dark:text-gray-300">
                                    <span>Tax</span>
                                    <span className="font-mono">{formatCurrency(transaction.tax)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-2 text-gray-700 dark:text-gray-300">
                                <span>Discount</span>
                                <span className="font-mono text-green-600 dark:text-green-400">-{formatCurrency(transaction.discount)}</span>
                            </div>

                            <div className="border-t border-gray-300 dark:border-gray-500 pt-3">
                                <div className="flex justify-between items-center py-2 text-lg font-bold text-gray-900 dark:text-white">
                                    <span>Total Amount</span>
                                    <span className="font-mono bg-blue-600 text-white px-3 py-1 rounded-lg">{formatCurrency(transaction.total)}</span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-600 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                    <span>Amount Paid</span>
                                    <span className="font-mono font-semibold">{formatCurrency(transaction.paid)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                    <span>Change Given</span>
                                    <span className="font-mono font-semibold text-green-600 dark:text-green-400">{formatCurrency(transaction.changeAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                    <span>Payment Method</span>
                                    <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                        {transaction?.paymentMethod?.name || 'Card'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ModalFooter>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Right-click and reload if printer dialog gets stuck</span>
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default PrinterPreviewModal;