import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik';
import { FunctionComponent } from 'react';
import { Button, Modal, ModalFooter } from '../../../../components';
import FormWrapper from '../../../../components/FormWrapper';
import FormInput from '../../../../components/FormInput';
import FormTextArea from '../../../../components/FormTextArea';
import FormSelectBox from '../../../../components/FormSelectBox';
import { getErrorMessage } from '../../../../utils/api-error-handler';

type Props = {
    permission?: Permission;
    categories: string[];
    scopes: string[];
    isOpen: boolean;
    onSave: (formData: any) => void;
    onClose: () => void;
}

const PermissionModal: FunctionComponent<Props> = ({ permission, categories, scopes, isOpen, onSave, onClose }) => {
    const initialValues = {
        name: permission?.name || '',
        description: permission?.description || '',
        category: permission?.category || '',
        scope: permission?.scope || '',
        isSystemPermission: permission?.isSystemPermission || false,
    };

    const permissionValidationSchema = Yup.object({
        name: Yup.string()
            .required('Permission name is required')
            .min(2, 'Permission name must be at least 2 characters'),

        description: Yup.string()
            .max(500, 'Description cannot exceed 500 characters'),

        category: Yup.string()
            .required('Category is required'),

        scope: Yup.string()
            .required('Scope is required'),

        isSystemPermission: Yup.boolean(),
    });

    const handleSubmit = async (values: any) => {
        try {
            await onSave(values);
            onClose();
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'An unknown error occurred');
            Notify.failure('Error saving permission: ' + errorMessage);
        }
    };

    const categoryOptions = categories.map(category => ({
        value: category,
        label: category
    }));

    const scopeOptions = scopes.map(scope => ({
        value: scope,
        label: scope
    }));

    return (
        <Modal
            title={permission ? 'Edit Permission' : 'Create New Permission'}
            isOpen={isOpen}
            onClose={onClose}
            className='max-w-md bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
        >
            <Formik
                initialValues={initialValues}
                validationSchema={permissionValidationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <FormWrapper>
                            <FormInput
                                label="Permission Name"
                                id="permissionName"
                                name="name"
                                type="text"
                                required
                                placeholder="Enter permission name"
                                className="mt-1"
                            />

                            <FormTextArea
                                label="Description"
                                id="description"
                                name="description"
                                placeholder="Enter permission description"
                                className="mt-1"
                                rows={3}
                            />

                            <FormSelectBox
                                label="Category"
                                id="category"
                                name="category"
                                required
                                options={categoryOptions}
                            />

                            <FormSelectBox
                                label="Scope"
                                id="scope"
                                name="scope"
                                required
                                options={scopeOptions}
                            />

                            <FormInput
                                type='checkbox'
                                label="System Permission"
                                name="isSystemPermission"
                                className="mt-1"
                            />
                        </FormWrapper>

                        <ModalFooter className='mb-0 border-t mt-4'>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    layout="outline"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={isSubmitting}
                                >
                                    {permission ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default PermissionModal;