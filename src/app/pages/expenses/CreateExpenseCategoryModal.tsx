import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik'
import { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react'
import { Receipt, WifiOff, Plus } from 'lucide-react';
import { Box, Flex, Text, Checkbox, Button } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import FormModal from '../../components/FormModal';
import FormInput from '../../components/FormInput';
import expenseCategoryService from '../../services/expense-category.service';
import { useConnectivity } from '../../hooks/useConnectivity';

type Props = {
    category?: ExpenseCategory;
    showAddButton?: boolean;
    children?: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: (category: ExpenseCategory) => void;
}

const CreateExpenseCategoryModal: FunctionComponent<PropsWithChildren<Props>> = ({
    category,
    showAddButton = true,
    isOpen = false,
    onClose,
    onSuccess,
}) => {
    const [isOpenForm, setIsOpenForm] = useState(isOpen);
    const { isOnline } = useConnectivity();
    const isEditing = !!category;

    const [categoryValues, setCategoryValues] = useState<Partial<CreateExpenseCategoryInput>>({
        name: '',
        isActive: true,
        sortOrder: 0,
    });

    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Please enter a category name')
            .min(2, 'Category name must be at least 2 characters')
            .max(100, 'Category name cannot exceed 100 characters'),
        isActive: Yup.boolean(),
        sortOrder: Yup.number().integer().min(0),
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpenForm(open);
        if (!open && onClose) {
            onClose();
        }
    };

    useEffect(() => {
        if (category) {
            setIsOpenForm(true);
            setCategoryValues({
                name: category.name || '',
                isActive: category.isActive ?? true,
                sortOrder: category.sortOrder ?? 0,
            });
        } else {
            setCategoryValues({ name: '', isActive: true, sortOrder: 0 });
        }
    }, [category]);

    useEffect(() => {
        setIsOpenForm(isOpen);
    }, [isOpen]);

    const handleSubmit = async (values: Partial<CreateExpenseCategoryInput>, { resetForm, setSubmitting }: any) => {
        if (!isOnline) {
            Notify.failure('You need an internet connection to save expense categories.');
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                ...values,
                sortOrder: values.sortOrder !== undefined && values.sortOrder !== null
                    ? Number(values.sortOrder)
                    : undefined,
            };

            if (isEditing && category) {
                const updated = await expenseCategoryService.updateExpenseCategory(category.categoryId, payload);
                Notify.success('Expense category updated');
                setIsOpenForm(false);
                onClose?.();
                onSuccess?.(updated);
            } else {
                const created = await expenseCategoryService.createExpenseCategory(payload as CreateExpenseCategoryInput);
                Notify.success('Expense category created');
                resetForm();
                setCategoryValues({ name: '', isActive: true, sortOrder: 0 });
                setIsOpenForm(false);
                onClose?.();
                onSuccess?.(created);
            }
        } catch (error) {
            console.error('Error saving expense category:', error);
            Notify.failure('An error occurred while saving the category. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <FormModal
            open={isOpenForm}
            onOpenChange={handleOpenChange}
            title={isEditing ? 'Edit Expense Category' : 'New Expense Category'}
            description={isEditing ? 'Update this expense category.' : 'Create a new expense category.'}
            icon={<Receipt className="w-4 h-4" />}
            trigger={
                showAddButton ? (
                    <Button type="button" variant="soft" size="2" onClick={() => setIsOpenForm(true)} title="New category">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Category</span>
                    </Button>
                ) : undefined
            }
        >
            {!isOnline && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                    <WifiOff className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                        Internet connection required to save expense categories.
                    </p>
                </div>
            )}
            <Formik
                initialValues={categoryValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
                key={category?.categoryId || 'new'}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <Flex direction="column" gap="4">
                            <FormInput
                                label="Category Name*"
                                name="name"
                                type="text"
                                required
                                placeholder="e.g., Rent, Utilities, Transport"
                            />

                            <FormInput
                                label="Sort Order"
                                name="sortOrder"
                                type="number"
                                placeholder="0"
                            />

                            <Flex asChild align="center" gap="2">
                                <label className="cursor-pointer">
                                    <Checkbox
                                        name="isActive"
                                        checked={values.isActive ?? true}
                                        onCheckedChange={(checked) => setFieldValue('isActive', !!checked)}
                                    />
                                    <Text as="span" size="2" weight="medium">
                                        Active (available when recording expenses)
                                    </Text>
                                </label>
                            </Flex>
                        </Flex>

                        <Box pt="4" mt="4" className="border-t border-gray-200 dark:border-gray-700">
                            <Flex gap="3">
                                <Dialog.Close asChild>
                                    <Button type="button" variant="soft" color="gray" style={{ flex: 1 }}>
                                        Cancel
                                    </Button>
                                </Dialog.Close>
                                <Button type="submit" variant="solid" loading={isSubmitting} style={{ flex: 2 }}>
                                    {isEditing ? 'Update Category' : 'Create Category'}
                                </Button>
                            </Flex>
                        </Box>
                    </Form>
                )}
            </Formik>
        </FormModal>
    );
};

export default CreateExpenseCategoryModal;
