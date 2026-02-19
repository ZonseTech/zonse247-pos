import * as Yup from 'yup';

// Validation schema for creating a staff member
export const createStaffValidationSchema = Yup.object().shape({
    fullname: Yup.string()
        .required('Staff name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters')
        .matches(/^[a-zA-Z\s'.\-]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
    email: Yup.string()
        .required('Email is required')
        .email('Please provide a valid email address'),
    phone: Yup.string()
        .matches(
            /^(\+265|265|0[89])\d{7,9}$/,
            'Please provide a valid phone number'
        )
        .nullable()
        .notRequired(),
    trackAttendance: Yup.boolean(),
    allowAppAccess: Yup.boolean(),
    calculateAs: Yup.string()
        .oneOf(['monthly', 'daily', 'hourly'], 'Invalid calculation type'),
    staffSalary: Yup.number()
        .nullable()
        .min(0, 'Salary must be 0 or higher'),
    avgShiftHours: Yup.number()
        .nullable()
        .min(1, 'Minimum 1 hour')
        .max(24, 'Maximum 24 hours'),
    joiningDate: Yup.date().nullable(),
    allowSelfAttendance: Yup.boolean(),
    attendanceType: Yup.string()
        .oneOf(['single', 'punch'], 'Invalid attendance type'),
    branchId: Yup.string().when('allowAppAccess', {
        is: true,
        then: (schema) => schema.required('Branch is required when app access is enabled'),
        otherwise: (schema) => schema.nullable(),
    }),
    roleId: Yup.string().when('allowAppAccess', {
        is: true,
        then: (schema) => schema.required('Role is required when app access is enabled'),
        otherwise: (schema) => schema.nullable(),
    }),
});

// Validation schema for updating a staff member
export const updateStaffValidationSchema = Yup.object().shape({
    fullname: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters')
        .matches(/^[a-zA-Z\s'.\-]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
    email: Yup.string()
        .email('Please provide a valid email address'),
    phone: Yup.string()
        .matches(
            /^(\+265|265|0[89])\d{7,9}$/,
            'Please provide a valid phone number'
        )
        .nullable()
        .notRequired(),
    trackAttendance: Yup.boolean(),
    allowAppAccess: Yup.boolean(),
    calculateAs: Yup.string()
        .oneOf(['monthly', 'daily', 'hourly'], 'Invalid calculation type'),
    staffSalary: Yup.number()
        .nullable()
        .min(0, 'Salary must be 0 or higher'),
    avgShiftHours: Yup.number()
        .nullable()
        .min(1, 'Minimum 1 hour')
        .max(24, 'Maximum 24 hours'),
    joiningDate: Yup.date().nullable(),
    allowSelfAttendance: Yup.boolean(),
    attendanceType: Yup.string()
        .oneOf(['single', 'punch'], 'Invalid attendance type'),
    branchId: Yup.string().when('allowAppAccess', {
        is: true,
        then: (schema) => schema.required('Branch is required when app access is enabled'),
        otherwise: (schema) => schema.nullable(),
    }),
    roleId: Yup.string().when('allowAppAccess', {
        is: true,
        then: (schema) => schema.required('Role is required when app access is enabled'),
        otherwise: (schema) => schema.nullable(),
    }),
});
