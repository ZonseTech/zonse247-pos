import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    supplierId: Yup.string().required('Supplier is required'),
    expectedDeliveryDate: Yup.string(),
    notes: Yup.string().max(1000, 'Notes are too long'),
    items: Yup.array()
        .of(
            Yup.object().shape({
                variantId: Yup.string().required('Product variant is required'),
                orderedQuantity: Yup.number()
                    .required('Quantity is required')
                    .min(1, 'Quantity must be at least 1'),
                unitPrice: Yup.number()
                    .required('Unit price is required')
                    .min(0, 'Unit price must be 0 or higher'),
            }),
        )
        .min(1, 'At least one item is required'),
});

export default validationSchema;