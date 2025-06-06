import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik'
import { Fragment, FunctionComponent, PropsWithChildren, useEffect, useState } from 'react'
import { HiOutlinePlus } from 'react-icons/hi'
import { Button, Modal, ModalFooter } from '../../components'
import FormWrapper from '../../components/FormWrapper'
import FormInput from '../../components/FormInput';
import IconButton from '../../components/IconButton';
import categoriesSerive from '../../services/category.service';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';
import { useProducts } from '../../context/ProductsProvider';

type Props = {
    category?: Category;
    showAddButton?: boolean;
    children?: React.ReactNode;
}

const CreateCategoryModal: FunctionComponent<PropsWithChildren<Props>> = ({ children, category, showAddButton = true }) => {
    const { reloadProducts } = useProducts();
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [categoryValues, setCategoryValues] = useState<Category>({
        uuid: '',
        name: '',
    } as Category);

    const newCategoryValidationSchema = Yup.object({
        name: Yup.string()
            .required('Please enter category name'),
    })

    const handleAddCategoryClicked = (state: boolean) => {
        setIsOpenForm(state);
    }

    useEffect(() => {
        if (category) {
            setIsOpenForm(true);
            setCategoryValues({ ...category });
        }
    }, [category]);

    const handleSubmit = async (values: Category) => {
        try {

            if (categoryValues.uuid) {
                await categoriesSerive.update(category.uuid.toString(), values);
                setCategoryValues({ uuid: '', name: '' })
            } else {
                await categoriesSerive.store(values);
            }

            values.name = '';

            const diagOptions = {
                title: "Category Saved",
                text: "Select an option below to continue.",
                okButtonText: "Add another",
                cancelButtonText: "Close",
            };

            reloadProducts();

            Confirm.show(
                diagOptions.title,
                diagOptions.text,
                diagOptions.okButtonText,
                diagOptions.cancelButtonText,
                () => {
                    // 
                },
                () => {
                    setIsOpenForm(false);
                }
            );
        } catch (error) {
            Notify.failure('An error occurred while saving the category');
        }
    }

    return (
        <Fragment>
            {children}

            {showAddButton && (<IconButton
                color='bg-yellow-400'
                className='rounded-r rounded-l-none'
                onClick={() => handleAddCategoryClicked(true)}
                icon={<HiOutlinePlus className='w-5 h-5' />}
            />)}

            <Modal
                title='Category'
                isOpen={isOpenForm}
                onClose={() => handleAddCategoryClicked(false)}
                className='max-w-xs bg-white text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
            >
                <Formik
                    initialValues={categoryValues}
                    validationSchema={newCategoryValidationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <FormWrapper>
                                <FormInput
                                    label="Name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Enter category name"
                                    className="mt-1"
                                />
                            </FormWrapper>

                            <ModalFooter className='mb-0 border-t mt-4'>
                                <Button type="submit" block={true} loading={isSubmitting}>
                                    Submit
                                </Button>
                            </ModalFooter>
                        </Form>
                    )}
                </Formik>
            </Modal>

        </Fragment>
    )
}

export default CreateCategoryModal