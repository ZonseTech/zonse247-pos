import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik';
import { HiOutlineCog } from 'react-icons/hi';
import FormInput from '../../components/FormInput';
import { useApp } from '../../context/AppProvider';
import IconButton from '../../components/IconButton';
import FormWrapper from '../../components/FormWrapper';
import FormTextArea from '../../components/FormTextArea';
import { name as AppName } from '../../../../package.json';
import settingsService from '../../services/settings.service';
import { Button, Modal, ModalFooter } from '../../components';
import { Fragment, type FunctionComponent, useEffect, useState } from 'react'

type Props = {
    showButton?: boolean;
    isDismissable?: boolean;
    setAppDetails?: boolean;
}

const Settings: FunctionComponent<Props> = ({ setAppDetails, isDismissable = true, showButton = true }) => {
    const { settings } = useApp();
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const settingsValues = {
        uuid: settings?.uuid || '',
        img: settings?.img || '',
        remove: settings?.remove || '0',
        app: settings?.app || '',
        tillName: settings?.tillName || '',
        store: settings?.store || '',
        addressOne: settings?.addressOne || '',
        addressTwo: settings?.addressTwo || '',
        contact: settings?.contact || '',
        tax: settings?.tax || '',
        symbol: settings?.symbol || '',
        percentage: settings?.percentage || 0,
        chargeTax: settings?.chargeTax || false,
        footer: settings?.footer || '',
        file: settings?.file || ''
    } as Setting

    const settingsValidationSchema = Yup.object().shape({
        store: Yup.string()
            .required('Store name is required')
            .max(100, 'Store name is too long'),

        tillName: Yup.string()
            .required('Till number is required'),

        addressOne: Yup.string()
            .required('Address line 1 is required')
            .max(200, 'Address is too long'),

        addressTwo: Yup.string()
            .required('Address line 2 is required')
            .max(200, 'Address is too long'),

        contact: Yup.string()
            .required('Contact number is required')
            .matches(/^[0-9+-\s]+$/, 'Invalid contact number format'),

        tax: Yup.string()
            .nullable()
            .matches(/^[0-9A-Za-z-]+$/, 'Invalid tax number format'),

        symbol: Yup.string()
            .required('Currency symbol is required')
            .min(1, 'Symbol must be 1-3 characters')
            .max(3, 'Symbol must be 1-3 characters'),

        percentage: Yup.number()
            .required('VAT percentage is required')
            .min(0, 'Percentage cannot be negative')
            .max(100, 'Percentage cannot exceed 100'),

        chargeTax: Yup.boolean(),

        imagename: Yup.mixed()
            .nullable()
            .test('fileSize', 'File size must be less than 2MB', (value: any) => {
                if (!value || typeof value === 'string') return true;
                return value.size <= 2000000;
            })
            .test('fileType', 'Only JPEG, PNG, or WEBP images are allowed', (value: any) => {
                if (!value || typeof value === 'string') return true;
                return ['image/jpeg', 'image/png', 'image/webp'].includes(value.type);
            }),

        footer: Yup.string()
            .nullable()
            .max(500, 'Footer text is too long')
    });

    useEffect(() => {
        if (setAppDetails && !hasInitialized) {
            setIsOpenForm(true);
            setHasInitialized(true);
        }
    }, [setAppDetails, hasInitialized]);

    const handleSettingsClicked = () => {
        setIsOpenForm(!isOpenForm);
    }

    const handleRemoveLogo = () => {
        // TODO: Implement the logic to remove app logo
    }

    const handleSubmit = async (values: Setting) => {
        try {
            const data = {
                ...values,
                app: AppName,
                percentage: values.percentage.toString(),
            }

            await settingsService.store(data);
            Notify.success('Settings saved successfully');

            setTimeout(() => {
                window.location.reload()
            }, 600)

        } catch (error) {
            Notify.failure('Failed to save settings' + error);
        }
    }

    return (
        <Fragment>
            {
                showButton && <IconButton
                    icon={<HiOutlineCog className='w-5 h-5' />}
                    color='bg-green-500'
                    onClick={handleSettingsClicked}
                />
            }

            <Modal
                title='Settings'
                isOpen={isOpenForm}
                onClose={handleSettingsClicked}
                showCloseButton={isDismissable}
                shouldCloseOnOverlayClick={isDismissable}
                className='max-w-lg bg-white text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'>

                <Formik
                    initialValues={settingsValues}
                    validationSchema={settingsValidationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <FormWrapper>
                                <input type="hidden" name="id" />
                                <input type="hidden" name="img" />
                                <input type="hidden" name="remove" value="false" />
                                <div className="flex gap-2">
                                    <FormInput
                                        type="text"
                                        name="store"
                                        label="Store Name"
                                        required
                                        placeholder="Cool Pharmacy"
                                    />
                                    <FormInput
                                        label='Till No.'
                                        type="text"
                                        name="tillName"
                                        required
                                        placeholder='Till number'
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <FormInput
                                        type="text"
                                        name="addressOne"
                                        label="Address Line 1"
                                        required
                                        placeholder="123 Main Street, Building#"
                                    />

                                    <FormInput
                                        type="text"
                                        name="addressTwo"
                                        label="Address Line 2"
                                        required
                                        placeholder="City, Country"
                                    />
                                </div>

                                <div className="flex gap-2">

                                    <FormInput
                                        type="tel"
                                        name="contact"
                                        label="Contact Number"
                                        required
                                        placeholder="0800 111 000"
                                    />

                                    <FormInput
                                        type="text"
                                        name="symbol"
                                        label="Currency Symbol"
                                        required
                                        minLength={1}
                                        maxLength={3}
                                        placeholder="MK"
                                    />
                                </div>

                                <div className="flex gap-2 justify-between items-center ">
                                    <FormInput
                                        type="text"
                                        name="tax"
                                        label="VAT Number"
                                        placeholder="VAT Number"
                                    />
                                    <FormInput
                                        label='VAT Percentage'
                                        type="number"
                                        name="percentage"
                                        min={0}
                                        max={100}
                                        required
                                        className='flex-1'
                                    />
                                    <FormInput
                                        type='checkbox'
                                        name="chargeTax"
                                        label="Charge VAT"
                                        className='flex-1'
                                    />
                                </div>

                                <div className="mt-1 hidden">
                                    <label>
                                        <span className="" onClick={handleRemoveLogo}>
                                            Remove
                                        </span>
                                        Logo
                                    </label>

                                    <FormInput
                                        type='file'
                                        label='Image'
                                        id="imagename"
                                        name="imagename"
                                        accept="image/*"
                                    />
                                </div>

                                <FormTextArea
                                    name="footer"
                                    label="Description"
                                    placeholder="Receipt Footer"
                                />
                            </FormWrapper>

                            <ModalFooter className='mb-0 border-t mt-4'>
                                <Button type="submit" block={true} loading={isSubmitting}>
                                    Save Settings
                                </Button>
                            </ModalFooter>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment >
    )
}

export default Settings