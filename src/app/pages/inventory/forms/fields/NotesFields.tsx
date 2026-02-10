import { FunctionComponent } from 'react';
import { Tag } from 'lucide-react';
import FormInput from '../../../../components/FormInput';
import Input from '../../../../components/Input';
import { CollapsibleSection } from '../../../../components';

interface NotesFieldsProps {
    fieldPrefix: string;
    isNewVariant?: boolean;
    getValue: (field: string) => string;
    onChange: (field: string, value: string) => void;
    hasData?: boolean;
}

const NotesFields: FunctionComponent<NotesFieldsProps> = ({
    fieldPrefix,
    isNewVariant = false,
    getValue,
    onChange,
    hasData = false,
}) => {
    return (
        <CollapsibleSection
            title="Internal Notes"
            icon={<Tag className="w-4 h-4" />}
            defaultOpen={hasData}
        >
            <div className="space-y-4">
                {isNewVariant ? (
                    <div className="space-y-1">
                        <Input
                            value={getValue('description')}
                            onChange={(e) => onChange('description', e.target.value)}
                            placeholder="Enter internal notes"
                        />
                    </div>
                ) : (
                    <FormInput
                        name={`${fieldPrefix}.description`}
                        placeholder="Enter internal notes"
                    />
                )}
            </div>
        </CollapsibleSection>
    );
};

export default NotesFields;
