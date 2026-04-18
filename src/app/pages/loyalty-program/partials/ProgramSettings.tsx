import { FunctionComponent } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Notify } from 'notiflix';
import * as Switch from '@radix-ui/react-switch';
import { Text, Flex } from '@radix-ui/themes';
import { Button } from '../../../components';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import { ComponentLoader } from '../../../components';
import loyaltyService from '../../../services/loyalty.service';
import OnboardingGuide from './OnboardingGuide';

interface ProgramSettingsProps {
    program: LoyaltyProgram | null;
    isLoading: boolean;
    onSaved: () => void;
}

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Program name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name is too long'),
    description: Yup.string().nullable().max(500, 'Description is too long'),
    pointsPerCurrency: Yup.number()
        .required('Points per currency is required')
        .min(0.01, 'Must be greater than 0'),
    currencyPerPoint: Yup.number()
        .required('Currency per point is required')
        .min(0.001, 'Must be greater than 0'),
    minRedeemPoints: Yup.number()
        .required('Minimum redeem points is required')
        .integer('Must be a whole number')
        .min(1, 'Must be at least 1'),
    pointsExpiryDays: Yup.number()
        .nullable()
        .integer('Must be a whole number')
        .min(1, 'Must be at least 1 day'),
});

const ProgramSettings: FunctionComponent<ProgramSettingsProps> = ({ program, isLoading, onSaved }) => {
    const isEditing = !!program;

    const initialValues = {
        name: program?.name || '',
        description: program?.description || '',
        pointsPerCurrency: program?.pointsPerCurrency ?? 1,
        currencyPerPoint: program?.currencyPerPoint ?? 0.01,
        minRedeemPoints: program?.minRedeemPoints ?? 100,
        pointsExpiryDays: program?.pointsExpiryDays ?? '',
        autoEnroll: program?.autoEnroll ?? false,
        isActive: program?.isActive ?? true,
    };

    if (isLoading) return <ComponentLoader loading />;

    const handleSubmit = async (values: typeof initialValues) => {
        try {
            const payload = {
                ...values,
                pointsExpiryDays: values.pointsExpiryDays === '' ? null : Number(values.pointsExpiryDays),
            };

            if (isEditing) {
                await loyaltyService.updateProgram(program.loyaltyProgramId, payload);
                Notify.success('Program updated successfully');
            } else {
                await loyaltyService.createProgram(payload);
                Notify.success('Loyalty program created');
            }
            onSaved();
        } catch (error: any) {
            const msg = error?.response?.data?.message || (isEditing ? 'Failed to update program' : 'Failed to create program');
            Notify.failure(msg);
        }
    };

    return (
        <div className="max-w-2xl">
            {!isEditing && <OnboardingGuide />}
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <FormWrapper>
                            <FormInput
                                type="text"
                                name="name"
                                label="Program Name*"
                                placeholder="e.g. Rewards Program"
                                required
                            />

                            <FormInput
                                type="text"
                                name="description"
                                label="Description"
                                placeholder="Optional description"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    type="number"
                                    name="pointsPerCurrency"
                                    label="Points Per Currency*"
                                    placeholder="1"
                                    step="0.01"
                                    required
                                />

                                <FormInput
                                    type="number"
                                    name="currencyPerPoint"
                                    label="Currency Per Point*"
                                    placeholder="0.01"
                                    step="0.001"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    type="number"
                                    name="minRedeemPoints"
                                    label="Min Redeem Points*"
                                    placeholder="100"
                                    required
                                />

                                <FormInput
                                    type="number"
                                    name="pointsExpiryDays"
                                    label="Points Expiry (Days)"
                                    placeholder="Leave empty for never"
                                />
                            </div>

                            <Flex align="center" gap="6" pt="2">
                                <Flex align="center" gap="2" asChild>
                                    <label className="cursor-pointer">
                                        <Switch.Root
                                            checked={values.autoEnroll}
                                            onCheckedChange={(checked) => setFieldValue('autoEnroll', checked)}
                                            className="w-9 h-5 bg-gray-300 dark:bg-gray-600 rounded-full relative data-[state=checked]:bg-sky-500 transition-colors"
                                        >
                                            <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[18px]" />
                                        </Switch.Root>
                                        <Text size="2" color="gray">
                                            Auto-enroll customers on first purchase
                                        </Text>
                                    </label>
                                </Flex>

                                {isEditing && (
                                    <Flex align="center" gap="2" asChild>
                                        <label className="cursor-pointer">
                                            <Switch.Root
                                                checked={values.isActive}
                                                onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                                                className="w-9 h-5 bg-gray-300 dark:bg-gray-600 rounded-full relative data-[state=checked]:bg-sky-500 transition-colors"
                                            >
                                                <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[18px]" />
                                            </Switch.Root>
                                            <Text size="2" color="gray">
                                                Program Active
                                            </Text>
                                        </label>
                                    </Flex>
                                )}
                            </Flex>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    theme="primary"
                                    loading={isSubmitting}
                                >
                                    {isEditing ? 'Update Program' : 'Create Program'}
                                </Button>
                            </div>
                        </FormWrapper>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ProgramSettings;
