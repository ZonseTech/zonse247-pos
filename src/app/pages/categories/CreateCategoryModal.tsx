import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik'
import { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from 'react'
import { HiOutlinePlus, HiX } from 'react-icons/hi'
import { Modal } from '../../components'
import FormWrapper from '../../components/FormWrapper'
import FormInput from '../../components/FormInput';
import categoriesService from '../../services/category.service';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';
import { useProducts } from '../../context/ProductsProvider';

type Props = {
    category?: Category;
    showAddButton?: boolean;
    children?: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
}

const CreateCategoryModal: FunctionComponent<PropsWithChildren<Props>> = ({
    category,
    showAddButton = true,
    isOpen = false,
    onClose,
    onSuccess
}) => {
    const { reloadProducts } = useProducts();
    const [isOpenForm, setIsOpenForm] = useState(isOpen);
    const [categoryValues, setCategoryValues] = useState<Partial<Category>>({
        uuid: '',
        name: '',
        description: '',
        color: '#3B82F6'
    });

    const predefinedColors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
        '#F97316', '#6366F1', '#14B8A6', '#EAB308'
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
                uuid: category.uuid || '',
                name: category.name || '',
                description: category.description || '',
                color: category.color || '#3B82F6'
            });
        } else {
            setCategoryValues({
                uuid: '',
                name: '',
                description: '',
                color: '#3B82F6'
            });
        }
    }, [category]);

    useEffect(() => {
        setIsOpenForm(isOpen);
    }, [isOpen]);

    const handleSubmit = async (values: Partial<Category>, { resetForm, setSubmitting }) => {
        try {
            setSubmitting(true);

            if (categoryValues.uuid && category) {
                await categoriesService.update(category.uuid.toString(), values);
                Notify.success('Category updated successfully!');
                setCategoryValues({ uuid: '', name: '', description: '', color: '#3B82F6' });

                if (onSuccess) {
                    onSuccess();
                }

                if (onClose) {
                    onClose();
                }

                setIsOpenForm(false);
                reloadProducts();
            } else {
                await categoriesService.store(values);

                const diagOptions = {
                    title: "Category Created Successfully",
                    text: "Your category has been saved. What would you like to do next?",
                    okButtonText: "Add Another Category",
                    cancelButtonText: "Close",
                };

                reloadProducts();

                Confirm.show(
                    diagOptions.title,
                    diagOptions.text,
                    diagOptions.okButtonText,
                    diagOptions.cancelButtonText,
                    () => {
                        resetForm();
                        setCategoryValues({ uuid: '', name: '', description: '', color: '#3B82F6' });
                    },
                    () => {
                        setIsOpenForm(false);
                        if (onClose) {
                            onClose();
                        }
                        if (onSuccess) {
                            onSuccess();
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

    const isEditing = !!category;

    return (
        <Fragment>
            {showAddButton && (
                <button
                    onClick={() => handleAddCategoryClicked(true)}
                    className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <HiOutlinePlus className='w-5 h-5' />
                    <span>Add Category</span>
                </button>
            )}

            <Modal
                isOpen={isOpenForm}
                onClose={() => handleAddCategoryClicked(false)}
                className='max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden'
                header={<div className="border-b border-gray-200 dark:border-gray-700 dark:from-gray-800 dark:to-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {isEditing ? 'Edit Category' : 'Create New Category'}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {isEditing ? 'Update your category details' : 'Add a new category to organize your products'}
                            </p>
                        </div>
                        <button
                            onClick={() => handleAddCategoryClicked(false)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <HiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>}
            >
                <div className="relative py-4">
                    <Formik
                        initialValues={categoryValues}
                        validationSchema={newCategoryValidationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                        key={category?.uuid || 'new'}
                    >
                        {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                            <Form className="space-y-6">
                                <FormWrapper>
                                    <FormInput
                                        label="Category Name"
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="Enter category name"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />

                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="Enter category description"
                                        value={values.description || ''}
                                        onChange={(e) => setFieldValue('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                                    />
                                    {errors.description && touched.description && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                    )}
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Category Color
                                    </label>
                                    <div className="grid grid-cols-6 gap-3">
                                        {predefinedColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFieldValue('color', color)}
                                                className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg ${values.color === color
                                                    ? 'border-gray-800 dark:border-white ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    {errors.color && touched.color && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.color}</p>
                                    )}
                                </FormWrapper>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</h4>
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                                            style={{ backgroundColor: values.color }}
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {values.name || 'Category Name'}
                                            </p>
                                            {values.description && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {values.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => handleAddCategoryClicked(false)}
                                        className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <span>{isEditing ? 'Update Category' : 'Create Category'}</span>
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