import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import * as Dialog from '@radix-ui/react-dialog';
import { Button, Flex } from '@radix-ui/themes';
import { FunctionComponent } from 'react';
import type { ChangeEvent } from 'react';
import FormModal from '../../../components/FormModal';
import TextInput from '../../../components/TextInput';
import BranchSelectField from '../../../components/BranchSelectField';
import terminalService from '../../../services/terminal.service';
import { capitalizeEachWord } from '../../../utils';
import { terminalValidationSchema } from '../../../schemas/terminal.schema';
import { getErrorMessage } from '../../../utils/api-error-handler';

interface TerminalFormValuesType {
    tenantId: string;
    branchId: string;
    terminalCode: string;
    terminalLabel: string;
    terminalPosition: number;
    deviceId: string;
    isPrimary: boolean;
    isBlocked: boolean;
    activationStatus: string;
}

interface TerminalFormModalProps {
    tenantId: string;
    onClose: () => void;
    onSaved: () => void;
}

const TerminalFormModal: FunctionComponent<TerminalFormModalProps> = ({ tenantId, onClose, onSaved }) => {
    const initialValues: TerminalFormValuesType = {
        tenantId,
        branchId: '',
        terminalCode: '',
        terminalLabel: '',
        terminalPosition: 1,
        deviceId: '',
        isPrimary: false,
        isBlocked: false,
        activationStatus: 'PENDING',
    };

    const handleSubmit = async (values: TerminalFormValuesType) => {
        try {
            await terminalService.store(values as CreateTerminalRequest);
            Notify.success('Terminal created successfully');
            onSaved();
            onClose();
        } catch (error: any) {
            Report.failure('Error', getErrorMessage(error, 'Failed to create terminal'), 'Okay');
        }
    };

    const handleLabelChange = (label: string, setFieldValue: (field: string, value: any) => void) => {
        setFieldValue('terminalLabel', capitalizeEachWord(label));
    };

    return (
        <Formik
            onSubmit={handleSubmit}
            initialValues={initialValues}
            validationSchema={terminalValidationSchema}
        >
            {({ isSubmitting, setFieldValue, values }) => (
                <FormModal
                    open
                    onOpenChange={(open) => { if (!open) onClose(); }}
                    title="New Terminal"
                    description="Required fields are marked with an asterisk (*)"
                    size="md"
                    footer={
                        <Flex justify="end" gap="3" width="100%">
                            <Dialog.Close asChild>
                                <Button type="button" variant="soft" color="gray">Cancel</Button>
                            </Dialog.Close>
                            <Button type="submit" form="terminal-create-form" disabled={isSubmitting} loading={isSubmitting}>
                                Create Terminal
                            </Button>
                        </Flex>
                    }
                >
                    <Form id="terminal-create-form">
                        <Flex direction="column" gap="4">
                            <BranchSelectField
                                name="branchId"
                                tenantId={values.tenantId}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <TextInput
                                    name="terminalLabel"
                                    label="Terminal Label"
                                    required
                                    placeholder="Enter terminal label"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        handleLabelChange(e.target.value, setFieldValue);
                                    }}
                                />

                                <TextInput
                                    type="number"
                                    name="terminalPosition"
                                    label="Terminal Position"
                                    placeholder="1"
                                    min="1"
                                    max="99"
                                />
                            </div>
                        </Flex>
                    </Form>
                </FormModal>
            )}
        </Formik>
    );
};

export default TerminalFormModal;
