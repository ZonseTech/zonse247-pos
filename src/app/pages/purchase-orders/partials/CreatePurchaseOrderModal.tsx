import { FunctionComponent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Form, Formik } from 'formik';
import { Flex, Text, Button } from '@radix-ui/themes';
import FormModal from '../../../components/FormModal';
import TextInput from '../../../components/TextInput';
import SupplierSearchSelect from '../../../components/SupplierSearchSelect';
import POItemsForm from './POItemsForm';
import { calculateTotal, formatCurrency } from './helpers';
import validationSchema from '../../../schemas/purchase-order.schema';
import type { POFormValues } from './types';

const emptyItem = { variantId: '', orderedQuantity: 1, unitPrice: 0, notes: '' };

const initialValues: POFormValues = {
    supplierId: '',
    expectedDeliveryDate: '',
    notes: '',
    items: [{ ...emptyItem }],
};

interface CreatePurchaseOrderModalProps {
    onClose: () => void;
    onSubmit: (values: POFormValues) => Promise<void>;
}

const emptyMap = new Map<string, never>();

const CreatePurchaseOrderModal: FunctionComponent<CreatePurchaseOrderModalProps> = ({ onClose, onSubmit }) => (
    <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
            try {
                await onSubmit(values);
                onClose();
            } finally {
                setSubmitting(false);
            }
        }}
    >
        {({ values, isSubmitting }) => (
            <FormModal
                open
                onOpenChange={(open) => { if (!open) onClose(); }}
                title="New Purchase Order"
                description="Saved as a request — approve it, send it, then receive against it."
                size="xl"
                footer={
                    <Flex align="center" justify="between" width="100%">
                        <Text size="3" weight="medium">
                            Order value {formatCurrency(calculateTotal(values.items))}
                        </Text>
                        <Flex gap="3">
                            <Dialog.Close asChild>
                                <Button type="button" variant="soft" color="gray">Cancel</Button>
                            </Dialog.Close>
                            <Button type="submit" form="po-create-form" disabled={isSubmitting} loading={isSubmitting}>
                                Raise Request
                            </Button>
                        </Flex>
                    </Flex>
                }
            >
                <Form id="po-create-form">
                    <Flex direction="column" gap="4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                            <SupplierSearchSelect name="supplierId" required />
                            <TextInput label="Expected Delivery Date" name="expectedDeliveryDate" type="date" />
                        </div>

                        <POItemsForm
                            items={values.items}
                            formMode="create-manual"
                            outstandingQtyMap={emptyMap}
                            requisitionOptionMap={emptyMap}
                        />

                        <TextInput label="Note for the supplier" name="notes" placeholder="Deliver before midday" />
                    </Flex>
                </Form>
            </FormModal>
        )}
    </Formik>
);

export default CreatePurchaseOrderModal;
