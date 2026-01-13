import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik'
import { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from 'react'
import { HiOutlinePlus, HiX } from 'react-icons/hi'
import { FolderOpen, Palette, FileText, Tag, Sparkles } from 'lucide-react';
import { Modal } from '../../components'
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
                <button
                    onClick={() => handleAddCategoryClicked(true)}
                    className="group bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
                >
                    <HiOutlinePlus className='w-5 h-5 group-hover:rotate-90 transition-transform duration-200' />
                    <span className="font-medium">Add Category</span>
                </button>
            )}

            <Modal
                isOpen={isOpenForm}
                onClose={() => handleAddCategoryClicked(false)}
                size="md"
                className='bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-200 dark:border-gray-700 overflow-hidden p-0'
                header={
                    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-700 dark:via-blue-800 dark:to-indigo-900 px-4 sm:px-6 py-5 sm:py-6">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

                        {/* Mobile drag handle */}
                        <div className="flex justify-center sm:hidden mb-3">
                            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
                        </div>

                        <div className="relative flex items-start justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="hidden sm:flex w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl items-center justify-center">
                                    {isEditing ? (
                                        <FolderOpen className="w-6 h-6 text-white" />
                                    ) : (
                                        <Sparkles className="w-6 h-6 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                        {isEditing ? 'Edit Category' : 'Create New Category'}
                                    </h2>
                                    <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1 max-w-[250px] sm:max-w-none">
                                        {isEditing ? 'Update your category details' : 'Organize your products with categories'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleAddCategoryClicked(false)}
                                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="relative p-4 sm:p-6">
                    <Formik
                        initialValues={categoryValues}
                        validationSchema={newCategoryValidationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                        key={category?.categoryId || 'new'}
                    >
                        {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                            <Form className="space-y-5 sm:space-y-6">
                                <FormWrapper>
                                    {/* Category Name Input */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            <Tag className="w-4 h-4 text-blue-500" />
                                            Category Name
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <FormInput
                                            label=""
                                            name="name"
                                            type="text"
                                            required
                                            placeholder="e.g., Electronics, Clothing, Food"
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>

                                    {/* Description Input */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            Description
                                            <span className="text-xs font-normal text-gray-400">(Optional)</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            placeholder="Add a brief description for this category..."
                                            value={values.description || ''}
                                            onChange={(e) => setFieldValue('description', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                                        />
                                        {errors.description && touched.description && (
                                            <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                                                <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Color Picker */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            <Palette className="w-4 h-4 text-purple-500" />
                                            Category Color
                                        </label>
                                        <div className="grid grid-cols-6 sm:grid-cols-6 gap-2 sm:gap-3">
                                            {predefinedColors.map(({ color, name }) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setFieldValue('color', color)}
                                                    title={name}
                                                    className={`group relative aspect-square rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${values.color === color
                                                        ? 'border-gray-900 dark:border-white ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 shadow-lg'
                                                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {values.color === color && (
                                                        <span className="absolute inset-0 flex items-center justify-center">
                                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.color && touched.color && (
                                            <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                                                <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                                                {errors.color}
                                            </p>
                                        )}
                                    </div>

                                    {/* Default Category Option */}
                                    {showDefaultOption && (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 sm:p-4">
                                            <label className="flex items-start gap-3 cursor-not-allowed">
                                                <input
                                                    type="checkbox"
                                                    name="isDefault"
                                                    checked={values.isDefault || false}
                                                    readOnly
                                                    disabled
                                                    className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-amber-600 border-amber-300 rounded focus:ring-amber-500 dark:border-amber-700 dark:bg-amber-900/30"
                                                />
                                                <div>
                                                    <span className="text-sm font-medium text-amber-900 dark:text-amber-200">
                                                        Set as Default Category
                                                    </span>
                                                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                                        This will be the first category, so it will be set as default
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </FormWrapper>

                                {/* Preview Section */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                        Live Preview
                                    </h4>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md flex-shrink-0"
                                                style={{ backgroundColor: values.color }}
                                            >
                                                {(values.name || 'C').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {values.name || 'Category Name'}
                                                </p>
                                                {values.description ? (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {values.description}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                                                        No description
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => handleAddCategoryClicked(false)}
                                        className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all font-medium active:scale-[0.98]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-xl transition-all font-medium disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                {isEditing ? (
                                                    <span>Update Category</span>
                                                ) : (
                                                    <>
                                                        <HiOutlinePlus className="w-4 h-4" />
                                                        <span>Create Category</span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Modal>
        </Fragment>
    )
}

export default CreateCategoryModal;