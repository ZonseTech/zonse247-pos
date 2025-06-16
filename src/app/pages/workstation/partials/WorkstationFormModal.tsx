import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Fragment, useState } from 'react';
import type { FunctionComponent } from 'react';
import { Button, Modal } from '../../../components';
import FormInput from '../../../components/FormInput';
import FormWrapper from '../../../components/FormWrapper';
import FormSelectBox from '../../../components/FormSelectBox';
import workstationsService from '../../../services/workstation.service';

interface WorkstationFormModalProps {
    workstation?: Workstation;
    isOpen?: boolean;
    onClose?: () => void;
    onWorkstationSaved?: () => void;
}

const WorkstationFormModal: FunctionComponent<WorkstationFormModalProps> = ({
    workstation,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    onWorkstationSaved
}) => {
    const [isOpenForm, setIsOpenForm] = useState(false);

    const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : isOpenForm;
    const closeModal = externalOnClose || (() => setIsOpenForm(false));

    const deviceTypes = [
        { label: 'Desktop', value: 'desktop' },
        { label: 'Tablet', value: 'tablet' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Web', value: 'web' }
    ];

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Maintenance', value: 'maintenance' }
    ];

    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const initialWorkstationValues: Workstation = workstation ? {
        ...workstation
    } : {
        uuid: generateUUID(),
        shop_id: '',
        client_id: '',
        till_name: '',
        till_number: '',
        device_id: '',
        device_type: 'desktop',
        ip_address: '',
        status: 'active',
        is_primary: false
    };

    const workstationValidationSchema = Yup.object().shape({
        uuid: Yup.string().required('UUID is required'),
        shop_id: Yup.string().required('Shop ID is required'),
        client_id: Yup.string().required('Client ID is required'),
        till_name: Yup.string()
            .required('Till name is required')
            .min(2, 'Till name must be at least 2 characters')
            .max(50, 'Till name is too long'),
        till_number: Yup.string()
            .required('Till number is required')
            .matches(/^[A-Za-z0-9-]+$/, 'Till number can only contain letters, numbers and hyphens'),
        device_id: Yup.string(),
        device_type: Yup.string()
            .required('Device type is required')
            .oneOf(['desktop', 'tablet', 'mobile', 'web'], 'Invalid device type'),
        ip_address: Yup.string()
            .matches(
                /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                'Invalid IP address format'
            ),
        status: Yup.string()
            .required('Status is required')
            .oneOf(['active', 'inactive', 'maintenance'], 'Invalid status'),
        is_primary: Yup.boolean()
    });

    const handleSubmit = async (values: Workstation, { resetForm }: any) => {
        try {
            if (workstation && workstation.uuid) {
                await workstationsService.update(workstation.uuid, values);
                Report.success("Updated!", "Workstation details updated successfully!", "Ok");
            } else {
                await workstationsService.store(values);
                Report.success("Great!", "Workstation details saved!", "Ok");
            }

            resetForm();
            closeModal();

            if (onWorkstationSaved) {
                onWorkstationSaved();
            }
        } catch (error: any) {
            console.error('Error saving workstation:', error);
            const errorMessage = error?.response?.data?.message || 'An error occurred while saving the workstation';
            Notify.failure(errorMessage);
        }
    };

    return (
        <Fragment>
            <Modal
                title={workstation ? 'Edit Workstation' : 'Add Workstation'}
                isOpen={isModalOpen}
                onClose={closeModal}
                className='max-w-lg bg-white text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
            >
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialWorkstationValues}
                    validationSchema={workstationValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form>
                            <FormWrapper>
                                <FormInput
                                    type="text"
                                    name="till_name"
                                    label="Till Name"
                                    required
                                    placeholder="Enter till name"
                                />

                                <FormInput
                                    type="text"
                                    name="till_number"
                                    label="Till Number"
                                    required
                                    placeholder="Enter till number"
                                />

                                <FormInput
                                    type="text"
                                    name="shop_id"
                                    label="Shop ID"
                                    required
                                    placeholder="Enter shop ID"
                                />

                                <FormInput
                                    type="text"
                                    name="client_id"
                                    label="Client ID"
                                    required
                                    placeholder="Enter client ID"
                                />

                                <FormSelectBox
                                    label="Device Type"
                                    name="device_type"
                                    required
                                    options={deviceTypes}
                                />

                                <FormInput
                                    type="text"
                                    name="device_id"
                                    label="Device ID"
                                    placeholder="Enter device ID (optional)"
                                />

                                <FormInput
                                    type="text"
                                    name="ip_address"
                                    label="IP Address"
                                    placeholder="192.168.1.100"
                                />

                                <FormSelectBox
                                    label="Status"
                                    name="status"
                                    required
                                    options={statusOptions}
                                />

                                <div className="mb-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={values.is_primary || false}
                                            onChange={(e) => setFieldValue('is_primary', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Set as Primary Workstation
                                        </span>
                                    </label>
                                    <div className="ml-6 mt-1">
                                        <div className="text-xs text-gray-500">
                                            Primary workstations are used as the main point for syncing data
                                        </div>
                                    </div>
                                </div>

                                {!workstation && (
                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                        <div className="text-sm text-blue-800">
                                            <strong>UUID:</strong> {values.uuid}
                                        </div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            This unique identifier will be automatically generated
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    block={true}
                                    loading={isSubmitting}
                                >
                                    {workstation ? 'Update Workstation' : 'Create Workstation'}
                                </Button>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment>
    );
};

export default WorkstationFormModal;