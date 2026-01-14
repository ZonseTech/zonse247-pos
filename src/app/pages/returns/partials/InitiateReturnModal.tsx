import { FunctionComponent, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Button, Modal } from '../../../components';
import FormWrapper from '../../../components/FormWrapper';
import FormSelectBox from '../../../components/FormSelectBox';
import FormTextArea from '../../../components/FormTextArea';
import FormInput from '../../../components/FormInput';
import returnsService from '../../../services/returns.service';
import { formatCurrency } from '../../../utils';
import { HiOutlineTrash } from 'react-icons/hi';

interface InitiateReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
    onSuccess?: () => void;
}

interface ReturnItemForm {
    orderItemId: string;
    productId: string;
    productName: string;
    returnQuantity: number;
    maxQuantity: number;
    returnReason: string;
    condition: ReturnCondition;
    notes: string;
    price: number;
}

const returnReasonOptions = [
    { value: 'defective', label: 'Defective/Damaged' },
    { value: 'wrong_item', label: 'Wrong Item' },
    { value: 'not_as_described', label: 'Not As Described' },
    { value: 'customer_changed_mind', label: 'Customer Changed Mind' },
    { value: 'duplicate_order', label: 'Duplicate Order' },
    { value: 'other', label: 'Other' },
];

const conditionOptions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'defective', label: 'Defective' },
];

const refundMethodOptions = [
    { value: 'original', label: 'Original Payment Method' },
    { value: 'cash', label: 'Cash' },
    { value: 'store_credit', label: 'Store Credit' },
];

const InitiateReturnModal: FunctionComponent<InitiateReturnModalProps> = ({
    isOpen,
    onClose,
    transaction,
    onSuccess,
}) => {
    const [selectedItems, setSelectedItems] = useState<ReturnItemForm[]>([]);
    const canReturn = returnsService.canReturn(transaction);
    const remainingRefundable = returnsService.getRemainingRefundableAmount(transaction);

    const initialValues = {
        refundReason: '',
        refundMethod: 'original' as 'original' | 'cash' | 'store_credit',
        partialRefund: false,
    };

    const validationSchema = Yup.object({
        refundReason: Yup.string().required('Refund reason is required'),
        refundMethod: Yup.string().required('Refund method is required'),
    });

    const handleAddItem = (item: any) => {
        // Use the orderId (UUID) as the unique identifier
        const orderItemId = item.orderId;
        const existingItem = selectedItems.find((i) => i.orderItemId === orderItemId);
        if (existingItem) {
            Notify.warning('Item already added to return list');
            return;
        }

        const newItem: ReturnItemForm = {
            orderItemId: orderItemId,
            productId: item.productId,
            productName: item.productDetails?.name || item.name || 'Unknown Product',
            returnQuantity: parseInt(item.quantity) || 1,
            maxQuantity: parseInt(item.quantity) || 1,
            returnReason: '',
            condition: 'good',
            notes: '',
            price: typeof item.sellPrice === 'string' ? parseFloat(item.sellPrice) : item.sellPrice,
        };

        setSelectedItems([...selectedItems, newItem]);
    };

    const handleRemoveItem = (orderItemId: string) => {
        setSelectedItems(selectedItems.filter((item) => item.orderItemId !== orderItemId));
    };

    const handleItemChange = (orderItemId: string, field: keyof ReturnItemForm, value: any) => {
        setSelectedItems(
            selectedItems.map((item) =>
                item.orderItemId === orderItemId ? { ...item, [field]: value } : item
            )
        );
    };

    const calculateRefundAmount = () => {
        return selectedItems.reduce((sum, item) => sum + item.price * item.returnQuantity, 0);
    };

    const handleSubmit = async (values: typeof initialValues) => {
        if (selectedItems.length === 0) {
            Notify.warning('Please select at least one item to return');
            return;
        }

        const invalidItems = selectedItems.filter(
            (item) => !item.returnReason || item.returnQuantity <= 0
        );
        if (invalidItems.length > 0) {
            Notify.warning('Please fill in all required fields for each item');
            return;
        }

        try {
            const data: InitiateReturnRequest = {
                originalTransactionId: transaction.transactionId,
                items: selectedItems.map((item) => ({
                    orderItemId: item.orderItemId,
                    productId: item.productId,
                    returnQuantity: item.returnQuantity,
                    returnReason: item.returnReason,
                    condition: item.condition,
                    notes: item.notes,
                })),
                refundReason: values.refundReason,
                refundMethod: values.refundMethod,
                partialRefund: values.partialRefund,
            };

            await returnsService.initiateReturn(data);
            Notify.success('Return initiated successfully');
            setSelectedItems([]);
            onSuccess?.();
            onClose();
        } catch (error: any) {
            Notify.failure(error?.message || 'Failed to initiate return');
        }
    };

    if (!canReturn) {
        return (
            <Modal
                title="Cannot Process Return"
                isOpen={isOpen}
                onClose={onClose}
                className="max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl"
            >
                <div className="p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        This transaction cannot be returned. It may already be refunded, cancelled, or
                        void.
                    </p>
                    <Button onClick={onClose} className="mt-4">
                        Close
                    </Button>
                </div>
            </Modal>
        );
    }

    const refundAmount = calculateRefundAmount();

    return (
        <Modal
            title="Initiate Return/Refund"
            isOpen={isOpen}
            onClose={onClose}
            size='full'
            className="max-w-6xl w-full mx-4 sm:mx-auto"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({ isSubmitting }) => (
                    <Form className="flex flex-col max-h-[80vh] sm:max-h-[75vh]">
                        <div className="flex-1 overflow-y-auto px-1 sm:pr-2">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                                <h3 className="font-semibold mb-2 text-sm sm:text-base">Transaction Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                        <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                            Transaction ID:
                                        </span>
                                        <span className="font-medium text-sm sm:ml-2">{transaction.refNumber}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                        <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                            Original Amount:
                                        </span>
                                        <span className="font-medium text-sm sm:ml-2">
                                            {formatCurrency(typeof transaction.total === 'string' ? parseFloat(transaction.total) : transaction.total)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                        <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                            Already Refunded:
                                        </span>
                                        <span className="font-medium text-sm sm:ml-2">
                                            {formatCurrency(typeof transaction.refundedAmount === 'string' ? parseFloat(transaction.refundedAmount) : (transaction.refundedAmount || 0))}
                                        </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                        <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                            Remaining Refundable:
                                        </span>
                                        <span className="font-medium text-sm sm:ml-2">
                                            {formatCurrency(remainingRefundable)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4 sm:mb-6">
                                <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Available Items</h3>
                                <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                                    {transaction.items?.map((item: any) => {
                                        const orderItemId = item.orderId;
                                        const isAdded = selectedItems.some((i) => i.orderItemId === orderItemId);

                                        return (
                                            <div
                                                key={orderItemId}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{item.productDetails?.name || item.name || 'Unknown Product'}</p>
                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                        Qty: {item.quantity} × {formatCurrency(typeof item.sellPrice === 'string' ? parseFloat(item.sellPrice) : item.sellPrice)}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="small"
                                                    onClick={() => handleAddItem(item)}
                                                    disabled={isAdded}
                                                    className="w-full sm:w-auto text-xs sm:text-sm"
                                                >
                                                    {isAdded ? 'Added' : 'Add to Return'}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {selectedItems.length > 0 && (
                                <div className="mb-4 sm:mb-6">
                                    <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Items to Return</h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        {selectedItems.map((item, index) => (
                                            <div
                                                key={item.orderItemId}
                                                className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                            >
                                                <div className="flex items-start justify-between mb-2 sm:mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm sm:text-base truncate">{item.productName}</h4>
                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                            Max Quantity: {item.maxQuantity}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item.orderItemId)}
                                                        className="text-red-600 hover:text-red-700 p-1 ml-2"
                                                    >
                                                        <HiOutlineTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Return Quantity <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={item.maxQuantity}
                                                            value={item.returnQuantity}
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    item.orderItemId,
                                                                    'returnQuantity',
                                                                    parseInt(e.target.value) || 1
                                                                )
                                                            }
                                                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Reason <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={item.returnReason}
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    item.orderItemId,
                                                                    'returnReason',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                                                        >
                                                            <option value="">Select a reason</option>
                                                            {returnReasonOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Condition <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={item.condition}
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    item.orderItemId,
                                                                    'condition',
                                                                    e.target.value as ReturnCondition
                                                                )
                                                            }
                                                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                                                        >
                                                            {conditionOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Notes
                                                        </label>
                                                        <textarea
                                                            rows={2}
                                                            value={item.notes}
                                                            placeholder="Additional notes..."
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    item.orderItemId,
                                                                    'notes',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedItems.length > 0 && (
                                <div className="mb-4 sm:mb-6">
                                    <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Refund Details</h3>
                                    <FormWrapper>
                                        <FormTextArea
                                            label="Refund Reason"
                                            name="refundReason"
                                            placeholder="Explain the reason for this refund..."
                                            rows={2}
                                            required
                                        />

                                        <FormSelectBox
                                            label="Refund Method"
                                            name="refundMethod"
                                            options={refundMethodOptions}
                                            required
                                        />

                                        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="flex items-center justify-between text-base sm:text-lg font-semibold">
                                                <span>Total Refund:</span>
                                                <span className="text-blue-600 dark:text-blue-400">
                                                    {formatCurrency(refundAmount)}
                                                </span>
                                            </div>
                                        </div>
                                    </FormWrapper>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 mt-4 sm:mt-6 pt-3 sm:pt-4 flex-shrink-0">
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                                <Button type="button" layout="outline" onClick={onClose} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={isSubmitting}
                                    disabled={selectedItems.length === 0}
                                    className="w-full sm:w-auto"
                                >
                                    Process Return
                                </Button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default InitiateReturnModal;
