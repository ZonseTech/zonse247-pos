import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik'
import { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from 'react'
import { HiOutlinePlus, } from 'react-icons/hi'
import { Palette, FileText, } from 'lucide-react';
import { Modal, Button } from '../../components'
import FormWrapper from '../../components/FormWrapper'
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
        color: '#3B82F6',
        isDefault: showDefaultOption,
    });

    const predefinedColors = [
        { color: '#3B82F6', name: 'Blue' },
        { color: '#EF4444', name: 'Red' },
        { color: '#10B981', name: 'Emerald' },
        { color: '#F59E0B', name: 'Amber' },
        { color: '#8B5CF6', name: 'Purple' },
        { color: '#EC4899', name: 'Pink' },
        { color: '#06B6D4', name: 'Cyan' },
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

    const handleAddCategoryClicked = (state: boolean) => {
        setIsOpenForm(state);
        if (!state && onClose) {
            onClose();
        }
    }

    useEffect(() => {
        if (category) {
            setIsOpenForm(true);
            setCategoryValues({
                categoryId: category.categoryId || '',
                name: category.name || '',
                description: category.description || '',
                color: category.color || '#3B82F6',
                isDefault: category.isDefault || false,
            });
        } else {
            setCategoryValues({
                categoryId: '',
                name: '',
                description: '',
                color: '#3B82F6',
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
                setCategoryValues({ categoryId: '', name: '', description: '', color: '#3B82F6', isDefault: false });

                if (onSuccess) {
                    onSuccess?.();
                }

                if (onClose) {
                    onClose?.();
                }

                setIsOpenForm(false);
            } else {
                await categoriesService.store(values);

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
                        setCategoryValues({ categoryId: '', name: '', description: '', color: '#3B82F6', isDefault: false });
                    },
                    () => {
                        setIsOpenForm(false);
                        if (onClose) {
                            onClose();
                        }
                        if (onSuccess) {
                            onSuccess?.();
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
        <Fragment>
            {showAddButton && (
                <Button
                    onClick={() => handleAddCategoryClicked(true)}
                    iconLeft={HiOutlinePlus}
                    layout="primary"
                    theme="primary"
                >
                    Add Category
                </Button>
            )}

            <Modal
                title={isEditing ? 'Edit Category' : 'New Category'}
                isOpen={isOpenForm}
                onClose={() => handleAddCategoryClicked(false)}
                className='max-w-lg bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
            >
                <Formik
                    initialValues={categoryValues}
                    validationSchema={newCategoryValidationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    key={category?.categoryId || 'new'}
                >
                    {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                        <Form>
                            <FormWrapper>
                                <FormInput
                                    label="Category Name*"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="e.g., Electronics, Clothing, Food"
                                />

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="Add a brief description for this category..."
                                        value={values.description || ''}
                                        onChange={(e) => setFieldValue('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                    {errors.description && touched.description && (
                                        <p className="text-sm text-red-500 dark:text-red-400">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Palette className="w-4 h-4 text-purple-500" />
                                        Category Color
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {predefinedColors.map(({ color, name }) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFieldValue('color', color)}
                                                title={name}
                                                className={`w-8 h-8 rounded-lg border-2 transition-all ${values.color === color
                                                    ? 'border-gray-900 dark:border-white scale-110'
                                                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            >
                                                {values.color === color && (
                                                    <svg className="w-4 h-4 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.color && touched.color && (
                                        <p className="text-sm text-red-500 dark:text-red-400">
                                            {errors.color}
                                        </p>
                                    )}
                                </div>

                                {showDefaultOption && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                        <label className="flex items-start gap-2 cursor-not-allowed">
                                            <input
                                                type="checkbox"
                                                name="isDefault"
                                                checked={values.isDefault || false}
                                                readOnly
                                                disabled
                                                className="mt-0.5 w-4 h-4 text-amber-500 border-amber-300 rounded"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-amber-900 dark:text-amber-200">
                                                    Set as Default Category
                                                </span>
                                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                                    First category will be set as default
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    block={true}
                                    loading={isSubmitting}
                                >
                                    {isEditing ? 'Update Category' : 'Submit'}
                                </Button>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment>
    )
}

export default CreateCategoryModal;