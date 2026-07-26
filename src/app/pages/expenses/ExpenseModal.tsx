import * as Yup from 'yup';
import { Form, Formik, type FormikHelpers } from 'formik';
import { FunctionComponent, useMemo } from 'react';
import { Lock, WifiOff } from 'lucide-react';
import { Notify } from 'notiflix';
import { Flex, Grid, Button, Text } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import FormModal from '../../components/FormModal';
import TextInput from '../../components/TextInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import FormTextArea from '../../components/FormTextArea';
import SupplierSearchSelect from '../../components/SupplierSearchSelect';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useConnectivity } from '../../hooks/useConnectivity';
import { expenseService } from '../../services';
import { getErrorMessage } from '../../utils/api-error-handler';
import ExpenseCategorySelect from './ExpenseCategorySelect';
import { expenseStatusConfig } from './partials/ExpenseTableColumns';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (expense: Expense) => void;
    /** Expense being viewed/edited. Omit (or pass null) to record a new one. */
    expense?: Expense | null;
}

interface ExpenseFormValues {
    categoryId: string;
    amount: string;
    paymentMethodId: string;
    supplierId: string;
    expenseDate: string;
    reference: string;
    notes: string;
}

const buildInitialValues = (expense?: Expense | null): ExpenseFormValues => ({
    categoryId: expense?.categoryId || '',
    amount: expense ? String(expense.amount) : '',
    paymentMethodId: expense?.paymentMethodId || '',
    supplierId: expense?.supplierId || '',
    expenseDate: expense?.expenseDate ? String(expense.expenseDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
    reference: expense?.reference || '',
    notes: expense?.notes || '',
});

const validationSchema = Yup.object().shape({
    categoryId: Yup.string().required('Category is required'),
    amount: Yup.number()
        .required('Amount is required')
        .moreThan(0, 'Amount must be greater than 0'),
    paymentMethodId: Yup.string(),
    supplierId: Yup.string(),
    expenseDate: Yup.string().required('Expense date is required'),
    reference: Yup.string(),
    notes: Yup.string().max(1000, 'Notes are too long'),
});

/**
 * Modal for recording, viewing, and editing a business expense. Doubles as a
 * read-only details view once the expense leaves PENDING_APPROVAL — approved,
 * rejected, and voided expenses are final and can no longer be edited.
 */
const ExpenseModal: FunctionComponent<ExpenseModalProps> = ({ isOpen, onClose, onSuccess, expense }) => {
    const { isOnline } = useConnectivity();
    const { paymentMethods } = usePaymentMethods();

    const isEditing = !!expense;
    const isLocked = isEditing && expense.status !== 'PENDING_APPROVAL';

    const paymentMethodOptions = useMemo(
        () => paymentMethods.map((m) => ({ label: m.name, value: m.methodId })),
        [paymentMethods],
    );

    const supplierInitialOption = useMemo(
        () => (expense?.supplier ? { label: expense.supplier.name, value: expense.supplier.id } : null),
        [expense],
    );

    // Re-derive fresh initial values every time the modal opens (or the target
    // expense changes) so a cancelled edit doesn't leak into the next open.
    const initialValues = useMemo(() => buildInitialValues(expense), [expense, isOpen]);

    const handleOpenChange = (open: boolean) => {
        if (!open) onClose();
    };

    const handleSubmit = async (values: ExpenseFormValues, { resetForm, setSubmitting }: FormikHelpers<ExpenseFormValues>) => {
        if (!isOnline) {
            Notify.failure('You need an internet connection to save expenses.');
            return;
        }

        const payload = {
            categoryId: values.categoryId,
            amount: Number(values.amount),
            paymentMethodId: values.paymentMethodId || undefined,
            supplierId: values.supplierId || undefined,
            expenseDate: values.expenseDate,
            reference: values.reference || undefined,
            notes: values.notes || undefined,
        };

        try {
            const result = isEditing
                ? await expenseService.updateExpense(expense.id, payload)
                : await expenseService.createExpense(payload);

            Notify.success(isEditing ? 'Expense updated' : 'Expense recorded — pending approval');
            resetForm();
            onSuccess(result);
        } catch (error) {
            Notify.failure(getErrorMessage(error, isEditing ? 'Failed to update expense' : 'Failed to record expense'));
        } finally {
            setSubmitting(false);
        }
    };

    const title = isLocked ? 'Expense Details' : isEditing ? 'Edit Expense' : 'Record Expense';
    const description = isLocked
        ? 'This expense can no longer be edited.'
        : isEditing
            ? 'Update the details below. Only expenses awaiting approval can be edited.'
            : 'Record a new business expense. New expenses require approval before they count against reports.';

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ isSubmitting, values, errors, touched, setFieldValue }) => (
                <FormModal
                    open={isOpen}
                    onOpenChange={handleOpenChange}
                    title={title}
                    description={description}
                    size="xl"
                    footer={
                        <Flex gap="3" justify="end">
                            <Dialog.Close asChild>
                                <Button type="button" variant="soft" color="gray">
                                    {isLocked ? 'Close' : 'Cancel'}
                                </Button>
                            </Dialog.Close>
                            {!isLocked && (
                                <Button
                                    type="submit"
                                    form="expense-form"
                                    color="green"
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                >
                                    {isEditing ? 'Save Changes' : 'Record Expense'}
                                </Button>
                            )}
                        </Flex>
                    }
                >
                    {isEditing && (
                        <Flex align="center" justify="between" gap="3" mb="4" wrap="wrap">
                            <Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300">
                                {expense.expenseNumber}
                            </Text>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${expenseStatusConfig[expense.status].bgColor} ${expenseStatusConfig[expense.status].textColor}`}>
                                {expenseStatusConfig[expense.status].label}
                            </span>
                        </Flex>
                    )}

                    {isLocked && (
                        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
                            <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {expenseStatusConfig[expense.status].label} expenses are final and cannot be edited.
                            </p>
                        </div>
                    )}

                    {!isLocked && !isOnline && (
                        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                            <WifiOff className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                Internet connection required to save expenses.
                            </p>
                        </div>
                    )}

                    <Form id="expense-form">
                        <Flex direction="column" gap="5">
                            <Grid columns={{ initial: '1', md: '2' }} gap="4">
                                <ExpenseCategorySelect
                                    value={values.categoryId}
                                    onChange={(categoryId) => setFieldValue('categoryId', categoryId)}
                                    error={errors.categoryId}
                                    touched={touched.categoryId}
                                    disabled={isLocked}
                                    allowCreate={!isLocked}
                                />

                                <TextInput label="Amount (MWK)" name="amount" type="number" step="1" min="0" placeholder="0.00" required disabled={isLocked} />
                                <TextInput label="Expense Date" name="expenseDate" type="date" required disabled={isLocked} />
                                <FormSearchableSelect
                                    label="Payment Method"
                                    name="paymentMethodId"
                                    options={paymentMethodOptions}
                                    placeholder="Select method..."
                                    isClearable
                                    disabled={isLocked}
                                />
                                <SupplierSearchSelect name="supplierId" disabled={isLocked} initialOption={supplierInitialOption} />
                                <TextInput label="Reference / Receipt No." name="reference" placeholder="e.g. RCT-00123" disabled={isLocked} />
                            </Grid>

                            <FormTextArea
                                label="Notes"
                                name="notes"
                                placeholder="Optional notes..."
                                rows={3}
                                disabled={isLocked}
                            />
                        </Flex>
                    </Form>
                </FormModal>
            )}
        </Formik>
    );
};

export default ExpenseModal;
