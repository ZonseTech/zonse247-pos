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
    title = "Print Receipt",
    transaction,
}) => {
    if (!isOpen) return null;

    const [isPrinting, setIsPrinting] = useState<boolean>(false);

    const { settings, printerOptions } = useApp()
    const handlePrintReceipt = async () => {
        try {
            setIsPrinting(true)
            await printerService.print({
                transaction,
                options: {
                    ...printerOptions,
                },
                settings,
            });

            Report.success(
                'Success',
                'Receipt printed successfuly',
                'Ok',
                handleCancelPayment
            );

        } catch (error) {
            Report.failure(
                'Print Error',
                'An error occurred while printing receipt.' + error,
                'OK'
            );
        } finally {
            setIsPrinting(false)
        }
    }

    const handleCancelPayment = () => {
        setIsOpen(false)
        setIsPaymentModalOpen(false)
    }

    return (
        <Modal
            title={title}
            isOpen={isOpen}
            onClose={handleCancelPayment}
            header={(
                <div className="flex justify-between items-center">
                    <Button disabled={isPrinting} className="bg-green-400 hover:bg-green-500"
                        onClick={handlePrintReceipt}>
                        {isPrinting ? 'Printing...' : 'Print'}
                    </Button>
                </div>
            )}
            className='max-w-md bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
        >
            <div className="p-0 max-h-[60vh] overflow-y-auto pr-2">
                <div className="border-t border-b py-4 mb-4 pr-2">
                    <div className="flex justify-center mb-4">
                        <div className="p-2 rounded flex items-center justify-center">
                            <img
                                alt={settings?.store}
                                src={Logo}
                                className="w-auto h-24 object-cover rounded"
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl text-gray-600 font-medium">
                            {settings?.store || ''}
                        </h2>
                        <p className="text-gray-500">
                            {settings?.addressLine1}
                        </p>
                        <p className="text-gray-500">
                            {settings?.addressLine2}
                        </p>
                        <p className="text-gray-500">
                            Tel: {settings?.contact}
                        </p>
                    </div>
                </div>

                <div className="border-b pb-4 mb-4">
                    <p className="text-gray-600"><span className="inline-block w-28">Ref No</span>: {transaction.refNumber}</p>
                    <p className="text-gray-600"><span className="inline-block w-28">Customer</span>: {transaction?.customer?.name as string || 'Walk in Customer'}</p>
                    <p className="text-gray-600"><span className="inline-block w-28">Cashier</span>: {transaction?.user?.fullname}</p>
                    <p className="text-gray-600"><span className="inline-block w-28">Date</span>: {formatDate(transaction.date)}</p>
                    {transaction.phoneNumber && (
                        <p className="text-gray-600"><span className="inline-block w-28">Phone</span>: {transaction.phoneNumber}</p>
                    )}
                    <p className="text-gray-600"><span className="inline-block w-28">Till</span>: {settings.tillName}</p>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between font-medium text-gray-600 mb-2">
                        <div className="w-1/3">Item</div>
                        <div className="w-1/3 text-center">Qty</div>
                        <div className="w-1/3 text-right">Price</div>
                    </div>

                    {Array.isArray(transaction.items) && (
                        transaction.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-gray-600 mb-2">
                                <div className="w-1/3">{item.name}</div>
                                <div className="w-1/3 text-center">{item.quantity}</div>
                                <div className="w-1/3 text-right">{formatCurrency(item.sellPrice)}</div>
                            </div>
                        ))
                    )}
                </div>

                <div className="border-t pt-4">
                    <div className="flex justify-between text-gray-600">
                        <div>Subtotal</div>
                        <div>{formatCurrency(transaction.subtotal)}</div>
                    </div>
                    {transaction.tax > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <div>Tax</div>
                            <div>{formatCurrency(transaction.tax)}</div>
                        </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                        <div>Discount</div>
                        <div>{formatCurrency(transaction.discount)}</div>
                    </div>
                    <div className="flex justify-between text-gray-600 font-medium">
                        <div>Total</div>
                        <div>{formatCurrency(transaction.total)}</div>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <div>Paid</div>
                        <div>{formatCurrency(transaction.paid)}</div>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <div>Change</div>
                        <div>{formatCurrency(transaction.changeAmount)}</div>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <div>Method</div>
                        <div>{transaction?.paymentMethod?.name || 'Card'}</div>
                    </div>
                </div>
            </div>

            <ModalFooter>
                <div className="mt-6">
                    <div className="bg-red-100 text-red-500 p-4 text-center rounded">
                        Right-Click and Reload if you get stuck after cancelling a print.
                    </div>
                </div>
            </ModalFooter>

        </Modal>
    );
};

export default PrinterPreviewModal;