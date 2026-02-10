import { FunctionComponent } from 'react';
import { Package } from 'lucide-react';
import FormInput from '../../../../components/FormInput';
import Input from '../../../../components/Input';
import { CollapsibleSection } from '../../../../components';

interface SkuFieldsProps {
    fieldPrefix: string;
    isNewVariant?: boolean;
    getValue: (field: string) => string;
    onChange: (field: string, value: string) => void;
    hasData?: boolean;
}

const SkuFields: FunctionComponent<SkuFieldsProps> = ({
    fieldPrefix,
    isNewVariant = false,
    getValue,
    onChange,
    hasData = false,
}) => {
    return (
        <CollapsibleSection
            title="SKU"
            icon={<Package className="w-4 h-4" />}
            defaultOpen={hasData}
        >
            <div className="space-y-4">
                {isNewVariant ? (
                    <div className="space-y-1">
                        <Input
                            value={getValue('sku')}
                            onChange={(e) => onChange('sku', e.target.value)}
                            placeholder="Stock Keeping Unit"
                        />
                    </div>
                ) : (
                    <FormInput
                        name={`${fieldPrefix}.sku`}
                        placeholder="Stock Keeping Unit"
                    />
                )}
            </div>
        </CollapsibleSection>
    );
};

export default SkuFields;
