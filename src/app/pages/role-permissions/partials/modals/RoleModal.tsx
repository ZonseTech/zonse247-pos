import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik';
import { FunctionComponent } from 'react';
import { Button, Modal, ModalFooter } from '../../../../components';
import FormWrapper from '../../../../components/FormWrapper';
import FormInput from '../../../../components/FormInput';
import FormTextArea from '../../../../components/FormTextArea';
import { getErrorMessage } from '../../../../utils/api-error-handler';

type Props = {
    role?: Role;
    isOpen: boolean;
    onSave: (formData: any) => void;
    onClose: () => void;
}

const RoleModal: FunctionComponent<Props> = ({ role, isOpen, onSave, onClose }) => {
    const initialValues = {
        name: role?.name || '',
        displayName: role?.displayName || '',
        description: role?.description || '',
        tenantId: role?.tenantId || '',
        branchId: role?.branchId || '',
        isActive: role?.isActive !== undefined ? role.isActive : true,
        isSystemRole: role?.isSystemRole || false,
    };

    const roleValidationSchema = Yup.object({
        name: Yup.string()
            .required('Role name is required')
            .min(2, 'Role name must be at least 2 characters'),

        displayName: Yup.string()
            .required('Role display name is required')
            .min(2, 'Role display name must be at least 2 characters'),

        description: Yup.string()
            .max(500, 'Description cannot exceed 500 characters'),

        tenantId: Yup.string(),

        branchId: Yup.string(),

        isActive: Yup.boolean(),

        isSystemRole: Yup.boolean(),
    });

    const handleSubmit = async (values: any) => {
        try {
            await onSave(values);
            onClose();
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'An unknown error occurred');
            Notify.failure('Error saving role: ' + errorMessage);
        }
    };

    return (
        <Modal
            title={role ? 'Edit Role' : 'Create New Role'}
            isOpen={isOpen}
            onClose={onClose}
            className='max-w-md bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
        >
            <Formik
                initialValues={initialValues}
                validationSchema={roleValidationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({ isSubmitting, values }) => (
                    <Form>
                        <FormWrapper>
                            <FormInput
                                label="Role Name"
                                id="roleName"
                                name="name"
                                type="text"
                                required
                                placeholder="Enter role name"
                                className="mt-1"
                            />

                            <FormInput
                                label="Display Name"
                                name="displayName"
                                type="text"
                                required
                                placeholder="Enter display name"
                                className="mt-1"
                            />

                            <FormTextArea
                                label="Description"
                                id="description"
                                name="description"
                                placeholder="Enter role description"
                                className="mt-1"
                                rows={3}
                            />

                            <div className='flex gap-2'>
                                <FormInput
                                    label="Tenant ID"
                                    id="tenantId"
                                    name="tenantId"
                                    type="text"
                                    placeholder="Enter tenant ID"
                                    className="mt-1"
                                />

                                <FormInput
                                    label="Branch ID"
                                    id="branchId"
                                    name="branchId"
                                    type="text"
                                    placeholder="Enter branch ID"
                                    className="mt-1"
                                />
                            </div>

                            <div className='flex gap-4'>
                                <FormInput
                                    type='checkbox'
                                    label="Active"
                                    name="isActive"
                                    className="mt-1"
                                />

                                <FormInput
                                    type='checkbox'
                                    label="System Role"
                                    name="isSystemRole"
                                    className="mt-1"
                                />
                            </div>
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
                                    {role ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default RoleModal;