import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik'
import { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react'
import { Plus, Palette, FileText, Check, X, FolderOpen } from 'lucide-react';
import { Box, Flex, Text, TextArea, Checkbox, Button, ScrollArea, Theme } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import FormInput from '../../components/FormInput';
import categoriesService from '../../services/category.service';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';

type Props = {
    category?: Category;
    showAddButton?: boolean;
    children?: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: (...arg: any) => void;
    categoriesCount?: number;
}

const CreateCategoryModal: FunctionComponent<PropsWithChildren<Props>> = ({
    category,
    showAddButton = true,
    isOpen = false,
    onClose,
    onSuccess,
    categoriesCount = 0,
}) => {
    const [isOpenForm, setIsOpenForm] = useState(isOpen);
    const isEditing = !!category;
    const showDefaultOption = !isEditing && categoriesCount === 0;

    const [categoryValues, setCategoryValues] = useState<Partial<Category>>({
        categoryId: '',
        name: '',
        description: '',
        color: '#06B6D4',
        isDefault: showDefaultOption,
    });

    const predefinedColors = [
        { color: '#06B6D4', name: 'Cyan' },
        { color: '#3B82F6', name: 'Blue' },
        { color: '#EF4444', name: 'Red' },
        { color: '#10B981', name: 'Emerald' },
        { color: '#F59E0B', name: 'Amber' },
        { color: '#8B5CF6', name: 'Purple' },
        { color: '#EC4899', name: 'Pink' },
        { color: '#84CC16', name: 'Lime' },
        { color: '#F97316', name: 'Orange' },
        { color: '#6366F1', name: 'Indigo' },
        { color: '#14B8A6', name: 'Teal' },
        { color: '#EAB308', name: 'Yellow' },
    ];

    const newCategoryValidationSchema = Yup.object({
        name: Yup.string()
            .required('Please enter category name')
            .min(2, 'Category name must be at least 2 characters')
            .max(50, 'Category name cannot exceed 50 characters'),
        description: Yup.string()
            .max(200, 'Description cannot exceed 200 characters'),
        color: Yup.string()
            .required('Please select a color')
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
                categoryId: category.categoryId || '',
                name: category.name || '',
                description: category.description || '',
                color: category.color || '#06B6D4',
                isDefault: category.isDefault || false,
            });
        } else {
            setCategoryValues({
                categoryId: '',
                name: '',
                description: '',
                color: '#06B6D4',
                isDefault: showDefaultOption,
            });
        }
    }, [category, showDefaultOption]);

    useEffect(() => {
        setIsOpenForm(isOpen);
    }, [isOpen]);

    const handleSubmit = async (values: Partial<Category>, { resetForm, setSubmitting }) => {
        try {
            setSubmitting(true);

            if (categoryValues.categoryId && category) {
                await categoriesService.update(category.categoryId.toString(), values);
                Notify.success('Category updated successfully!');
                setCategoryValues({ categoryId: '', name: '', description: '', color: '#06B6D4', isDefault: false });

                if (onSuccess) {
                    onSuccess?.();
                }

                if (onClose) {
                    onClose?.();
                }

                setIsOpenForm(false);
            } else {
                const response = await categoriesService.store(values);
                const createdCategory = response?.data || response;

                const diagOptions = {
                    title: "Category Created Successfully",
                    text: "Your category has been saved. What would you like to do next?",
                    okButtonText: "Add Another Category",
                    cancelButtonText: "Close",
                };

                Confirm.show(
                    diagOptions.title,
                    diagOptions.text,
                    diagOptions.okButtonText,
                    diagOptions.cancelButtonText,
                    () => {
                        resetForm();
                        setCategoryValues({ categoryId: '', name: '', description: '', color: '#06B6D4', isDefault: false });
                    },
                    () => {
                        setIsOpenForm(false);
                        if (onClose) {
                            onClose();
                        }
                        if (onSuccess) {
                            onSuccess?.(createdCategory);
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Error saving category:', error);
            Notify.failure('An error occurred while saving the category. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            {showAddButton && (
                <Button
                    onClick={() => handleOpenChange(true)}
                    variant="solid"
                    highContrast
                >
                    <Plus size={16} />
                    Add Category
                </Button>
            )}

            <Dialog.Root open={isOpenForm} onOpenChange={handleOpenChange}>
                <Dialog.Portal>
                    <Theme appearance="inherit" accentColor="cyan">
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
                        <Dialog.Content
                            className="fixed z-50 bg-white dark:bg-gray-800 shadow-2xl flex flex-col overflow-hidden
                                       bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh]
                                       sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                                       sm:rounded-2xl sm:w-[calc(100%-2rem)] sm:max-w-lg sm:max-h-[85vh]
                                       data-[state=open]:animate-in data-[state=closed]:animate-out
                                       data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
                                       data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95
                                       data-[state=closed]:slide-out-to-bottom sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95
                                       duration-200"
                        >
                            {/* Mobile drag handle */}
                            <div className="flex justify-center sm:hidden pt-2">
                                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                            </div>

                            {/* Header */}
                            <Flex
                                justify="between"
                                align="center"
                                px="4"
                                py="3"
                                className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
                            >
                                <Flex align="center" gap="3">
                                    <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                                        <FolderOpen className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                    </div>
                                    <Dialog.Title asChild>
                                        <Text size="3" weight="bold" as="p">
                                            {isEditing ? 'Edit Category' : 'New Category'}
                                        </Text>
                                    </Dialog.Title>
                                </Flex>
                                <Dialog.Close asChild>
                                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </Dialog.Close>
                            </Flex>

                            {/* Body */}
                            <ScrollArea scrollbars="vertical" className="flex-1">
                                <Box p="4">
                                    <Formik
                                        initialValues={categoryValues}
                                        validationSchema={newCategoryValidationSchema}
                                        onSubmit={handleSubmit}
                                        enableReinitialize={true}
                                        key={category?.categoryId || 'new'}
                                    >
                                        {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                                            <Form>
                                                <Flex direction="column" gap="4">
                                                    <FormInput
                                                        label="Category Name*"
                                                        name="name"
                                                        type="text"
                                                        required
                                                        placeholder="e.g., Electronics, Clothing, Food"
                                                    />

                                                    <Box>
                                                        <Flex align="center" gap="2" mb="2">
                                                            <FileText size={16} className="text-gray-400" />
                                                            <Text as="label" size="2" weight="medium">Description</Text>
                                                        </Flex>
                                                        <TextArea
                                                            name="description"
                                                            placeholder="Add a brief description for this category..."
                                                            value={values.description || ''}
                                                            onChange={(e) => setFieldValue('description', e.target.value)}
                                                            rows={3}
                                                        />
                                                        {errors.description && touched.description && (
                                                            <Text size="1" color="red" mt="1">
                                                                {errors.description}
                                                            </Text>
                                                        )}
                                                    </Box>

                                                    <Box>
                                                        <Flex align="center" gap="2" mb="2">
                                                            <Palette size={16} className="text-purple-500" />
                                                            <Text as="label" size="2" weight="medium">Category Color</Text>
                                                        </Flex>
                                                        <Flex wrap="wrap" gap="2">
                                                            {predefinedColors.map(({ color, name }) => (
                                                                <button
                                                                    key={color}
                                                                    type="button"
                                                                    onClick={() => setFieldValue('color', color)}
                                                                    title={name}
                                                                    className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center ${values.color === color
                                                                        ? 'border-gray-900 dark:border-white scale-110'
                                                                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                                                                        }`}
                                                                    style={{ backgroundColor: color }}
                                                                >
                                                                    {values.color === color && (
                                                                        <Check size={16} className="text-white" strokeWidth={3} />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </Flex>
                                                        {errors.color && touched.color && (
                                                            <Text size="1" color="red" mt="1">
                                                                {errors.color}
                                                            </Text>
                                                        )}
                                                    </Box>

                                                    {showDefaultOption && (
                                                        <Box className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                                            <Flex asChild align="start" gap="2">
                                                                <label className="cursor-not-allowed">
                                                                    <Checkbox
                                                                        name="isDefault"
                                                                        checked={values.isDefault || false}
                                                                        disabled
                                                                        color="orange"
                                                                        mt="1"
                                                                    />
                                                                    <Box>
                                                                        <Text as="span" size="2" weight="medium" className="text-amber-900 dark:text-amber-200">
                                                                            Set as Default Category
                                                                        </Text>
                                                                        <Text as="p" size="1" className="text-amber-700 dark:text-amber-400" mt="1">
                                                                            First category will be set as default
                                                                        </Text>
                                                                    </Box>
                                                                </label>
                                                            </Flex>
                                                        </Box>
                                                    )}
                                                </Flex>

                                                {/* Footer */}
                                                <Box pt="4" mt="4" className="border-t border-gray-200 dark:border-gray-700">
                                                    <Flex gap="3">
                                                        <Dialog.Close asChild>
                                                            <Button
                                                                type="button"
                                                                variant="soft"
                                                                color="gray"
                                                                style={{ flex: 1 }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </Dialog.Close>
                                                        <Button
                                                            type="submit"
                                                            variant="solid"
                                                            loading={isSubmitting}
                                                            style={{ flex: 2 }}
                                                        >
                                                            {isEditing ? 'Update Category' : 'Create Category'}
                                                        </Button>
                                                    </Flex>
                                                </Box>
                                            </Form>
                                        )}
                                    </Formik>
                                </Box>
                            </ScrollArea>
                        </Dialog.Content>
                    </Theme>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    )
}

export default CreateCategoryModal;