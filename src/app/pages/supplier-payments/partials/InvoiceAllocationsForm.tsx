import { FunctionComponent } from 'react';
import { useFormikContext, FieldArray } from 'formik';
import { Flex, Text } from '@radix-ui/themes';
import { FileText, Loader2, CheckCircle2, Ban } from 'lucide-react';
import { FormFieldCard } from '../../../components';
import type { PaymentFormValues, AllocationRow } from './types';
import { formatCurrency, formatDate } from './helpers';

interface InvoiceAllocationsFormProps {
    outstandingInvoices: SupplierInvoiceWithItems[];
    loadingInvoices: boolean;
}

const InvoiceAllocationsForm: FunctionComponent<InvoiceAllocationsFormProps> = ({
    outstandingInvoices,
    loadingInvoices,
}) => {
    const { values, setFieldValue } = useFormikContext<PaymentFormValues>();

    return (
        <FormFieldCard title="Invoice Allocations">
            <div className="p-5">
                {!values.supplierId ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Select a supplier first to see outstanding invoices</p>
                    </div>
                ) : loadingInvoices ? (
                    <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-emerald-500" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading outstanding invoices...</p>
                    </div>
                ) : outstandingInvoices.length === 0 && values.allocations.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No outstanding invoices for this supplier</p>
                    </div>
                ) : (
                    <FieldArray name="allocations">
                        {({ push, remove }) => (
                            <div className="space-y-4">
                                {/* Available invoices to allocate */}
                                {outstandingInvoices.length > 0 && (
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Select invoices to allocate payment
                                            </p>
                                        </div>
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-60 overflow-y-auto">
                                            {outstandingInvoices.map((inv) => {
                                                const isSelected = values.allocations.some((a) => a.invoiceId === inv.id);
                                                return (
                                                    <div
                                                        key={inv.id}
                                                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                                                            isSelected
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                                        }`}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                const idx = values.allocations.findIndex((a) => a.invoiceId === inv.id);
                                                                if (idx >= 0) remove(idx);
                                                            } else {
                                                                push({
                                                                    invoiceId: inv.id,
                                                                    invoiceNumber: inv.invoiceNumber,
                                                                    totalAmount: inv.totalAmount,
                                                                    balanceDue: inv.balanceDue,
                                                                    allocatedAmount: inv.balanceDue,
                                                                    notes: '',
                                                                } as AllocationRow);
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                                    isSelected
                                                                        ? 'bg-emerald-500 border-emerald-500'
                                                                        : 'border-gray-300 dark:border-gray-500'
                                                                }`}
                                                            >
                                                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {inv.invoiceNumber}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Due: {formatDate(inv.dueDate)} &middot; Total: {formatCurrency(inv.totalAmount)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                                                {formatCurrency(inv.balanceDue)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Balance Due</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Allocation amounts editor */}
                                {values.allocations.length > 0 && (
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Allocation Amounts
                                            </p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100 dark:border-gray-700">
                                                        <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Invoice</th>
                                                        <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Balance Due</th>
                                                        <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right w-40">Amount to Pay</th>
                                                        <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 w-10" />
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {values.allocations.map((alloc, idx) => (
                                                        <tr key={alloc.invoiceId}>
                                                            <td className="px-4 py-2">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {alloc.invoiceNumber}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 text-right">
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {formatCurrency(alloc.balanceDue)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={alloc.balanceDue}
                                                                    step="0.01"
                                                                    value={alloc.allocatedAmount}
                                                                    onChange={(e) => {
                                                                        const val = Number(e.target.value) || 0;
                                                                        setFieldValue(`allocations.${idx}.allocatedAmount`, val);
                                                                    }}
                                                                    className={`w-full text-right px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                                                                        Number(alloc.allocatedAmount) > alloc.balanceDue
                                                                            ? 'border-red-400 dark:border-red-500'
                                                                            : 'border-gray-300 dark:border-gray-600'
                                                                    }`}
                                                                />
                                                                {Number(alloc.allocatedAmount) > alloc.balanceDue && (
                                                                    <p className="text-xs text-red-500 mt-1 text-right">Exceeds balance</p>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => remove(idx)}
                                                                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                                    title="Remove"
                                                                >
                                                                    <Ban className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Allocation summary */}
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                            <AllocationSummary />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </FieldArray>
                )}
            </div>
        </FormFieldCard>
    );
};

// ── AllocationSummary (renders inside Formik) ───────────────────────────────

const AllocationSummary: FunctionComponent = () => {
    const { values } = useFormikContext<PaymentFormValues>();

    const totalAllocated = values.allocations.reduce((sum, a) => sum + Number(a.allocatedAmount || 0), 0);
    const paymentAmount = Number(values.amount || 0);
    const difference = paymentAmount - totalAllocated;
    const isBalanced = Math.abs(difference) <= 0.01;

    return (
        <Flex direction={{ initial: 'column', sm: 'row' }} align={{ sm: 'center' }} justify="between" gap="2">
            <Flex align="center" gap="4">
                <Text size="2" color="gray">
                    Payment: <Text weight="bold">{formatCurrency(paymentAmount)}</Text>
                </Text>
                <Text size="2" color="gray">
                    Allocated: <Text weight="bold">{formatCurrency(totalAllocated)}</Text>
                </Text>
            </Flex>
            <Flex align="center" gap="1">
                {isBalanced ? (
                    <Text size="2" weight="medium" color="green">
                        <Flex align="center" gap="1">
                            <CheckCircle2 className="w-4 h-4" />
                            Balanced
                        </Flex>
                    </Text>
                ) : (
                    <Text size="2" weight="medium" color="red">
                        Difference: {formatCurrency(Math.abs(difference))}
                        {difference > 0 ? ' (under-allocated)' : ' (over-allocated)'}
                    </Text>
                )}
            </Flex>
        </Flex>
    );
};

export default InvoiceAllocationsForm;
