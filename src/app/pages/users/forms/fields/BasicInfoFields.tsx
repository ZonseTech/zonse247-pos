import type { FunctionComponent } from 'react';
import FormFieldCard from '../../../../components/card/FormFieldCard';
import FormInput from '../../../../components/FormInput';

interface BasicInfoFieldsProps {
    isEditMode?: boolean;
}

const BasicInfoFields: FunctionComponent<BasicInfoFieldsProps> = ({ isEditMode = false }) => {
    return (
        <FormFieldCard>
            <div className="space-y-4">
                <FormInput
                    label="Staff Name"
                    name="fullname"
                    placeholder="Letters and spaces only"
                    required
                />
                <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    required={!isEditMode}
                />
                <FormInput
                    label="Phone"
                    name="phone"
                    type="tel"
                    placeholder="e.g., +265123456789"
                />
            </div>
        </FormFieldCard>
    );
};

export default BasicInfoFields;
