import * as Yup from 'yup';

export const terminalValidationSchema = Yup.object().shape({
    terminalLabel: Yup.string()
        .required('Terminal label is required')
        .min(3, 'Label must be at least 3 characters')
        .max(100, 'Label is too long'),
    tenantId: Yup.string().required('Tenant is required'),
    branchId: Yup.string().required('Branch is required'),
    terminalPosition: Yup.number()
        .min(1, 'Position must be at least 1')
        .max(99, 'Position cannot exceed 99'),
    deviceId: Yup.string().max(255, 'Device ID is too long'),
    isPrimary: Yup.boolean(),
    isBlocked: Yup.boolean(),
});
