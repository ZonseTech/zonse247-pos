import { FunctionComponent } from 'react';
import { Calendar } from 'lucide-react';
import FormInput from '../../../../components/FormInput';
import Input from '../../../../components/Input';
import Label from '../../../../components/Label';
import { CollapsibleSection } from '../../../../components';
import dayjs from 'dayjs';

interface ExpiryFieldsProps {
    fieldPrefix: string;
    isNewVariant?: boolean;
    getStringValue: (field: string) => string;
    getNumberValue: (field: string) => number | string;
    onStringChange: (field: string, value: string) => void;
    onNumberChange: (field: string, value: string) => void;
    hasData?: boolean;
}

const ExpiryFields: FunctionComponent<ExpiryFieldsProps> = ({
    fieldPrefix,
    isNewVariant = false,
    getStringValue,
    getNumberValue,
    onStringChange,
    onNumberChange,
    hasData = false,
}) => {
    return (
        <CollapsibleSection
            title="Track Expiry?"
            icon={<Calendar className="w-4 h-4" />}
            defaultOpen={hasData}
        >
            <div className="grid grid-cols-2 gap-3">
                {isNewVariant ? (
                    <>
                        <div className="space-y-1">
                            <Label>Expiry Date</Label>
                            <Input
                                value={getStringValue('expirationDate')}
                                onChange={(e) => onStringChange('expirationDate', e.target.value)}
                                type="date"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Expiry Date Alert</Label>
                            <Input
                                value={getNumberValue('expiryDateAlert')}
                                onChange={(e) => onNumberChange('expiryDateAlert', e.target.value)}
                                type="number"
                                placeholder="Days before expiry"
                                min={0}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <FormInput
                            label="Expiry Date"
                            name={`${fieldPrefix}.expirationDate`}
                            type="date"
                            placeholder={dayjs().add(1, 'month').format('DD/MM/YYYY')}
                        />
                        <FormInput
                            label="Expiry Date Alert"
                            name={`${fieldPrefix}.expiryAlertDays`}
                            type="number"
                            placeholder="Before 5 Days"
                            min="0"
                        />
                    </>
                )}
            </div>
        </CollapsibleSection>
    );
};

export default ExpiryFields;
