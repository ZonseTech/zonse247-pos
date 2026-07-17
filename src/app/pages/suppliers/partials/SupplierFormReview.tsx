import { FC } from 'react';
import { Pencil } from 'lucide-react';
import { Box, Flex, Grid, Text, IconButton, Tooltip } from '@radix-ui/themes';
import { FormFieldCard } from '../../../components';

interface SelectOption {
    label: string;
    value: string;
}

interface SupplierFormReviewValues {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    paymentTerms: string;
    creditLimit: number | string;
    status: string;
    identifierType: string;
    identifierNumber: string;
}

interface SupplierFormReviewProps {
    values: SupplierFormReviewValues;
    paymentTermsOptions: SelectOption[];
    statusOptions: SelectOption[];
    identifierTypeOptions: SelectOption[];
    onEditStep: (stepId: number) => void;
}

const optionLabel = (options: SelectOption[], value: string) =>
    options.find((o) => o.value === value)?.label || (value || '—');

const ReviewField: FC<{ label: string; value: string }> = ({ label, value }) => (
    <Box>
        <Text as="p" size="1" weight="medium" color="gray">
            {label}
        </Text>
        <Text as="p" size="2" className="text-gray-900 dark:text-gray-100 mt-0.5">
            {value || '—'}
        </Text>
    </Box>
);

const EditStepButton: FC<{ onClick: () => void }> = ({ onClick }) => (
    <Tooltip content="Edit this section">
        <IconButton type="button" size="1" variant="ghost" onClick={onClick} aria-label="Edit section">
            <Pencil className="w-3.5 h-3.5" />
        </IconButton>
    </Tooltip>
);

const SupplierFormReview: FC<SupplierFormReviewProps> = ({
    values,
    paymentTermsOptions,
    statusOptions,
    identifierTypeOptions,
    onEditStep,
}) => (
    <Flex direction="column" gap="6">
        <FormFieldCard
            title="Basic Information"
            headerAction={<EditStepButton onClick={() => onEditStep(1)} />}
        >
            <Grid columns={{ initial: '1', md: '2' }} gap="4">
                <ReviewField label="Supplier Name" value={values.name} />
                <ReviewField label="Contact Person" value={values.contactPerson} />
                <ReviewField label="Email" value={values.email} />
                <ReviewField label="Phone" value={values.phone} />
                <ReviewField label="Address" value={values.address} />
                <ReviewField label="Tax ID / VAT Number" value={values.taxId} />
                <ReviewField label="Identifier Type" value={optionLabel(identifierTypeOptions, values.identifierType)} />
                <ReviewField label="Supplier Identity" value={values.identifierNumber} />
            </Grid>
        </FormFieldCard>

        <FormFieldCard
            title="Payment & Terms"
            headerAction={<EditStepButton onClick={() => onEditStep(2)} />}
        >
            <Grid columns={{ initial: '1', md: '2' }} gap="4">
                <ReviewField label="Payment Terms" value={optionLabel(paymentTermsOptions, values.paymentTerms)} />
                <ReviewField label="Credit Limit" value={String(values.creditLimit ?? 0)} />
                <ReviewField label="Status" value={optionLabel(statusOptions, values.status)} />
            </Grid>
        </FormFieldCard>
    </Flex>
);

export default SupplierFormReview;
