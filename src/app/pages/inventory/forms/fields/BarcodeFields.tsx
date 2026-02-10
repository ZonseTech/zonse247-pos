import { FunctionComponent, useState, ChangeEvent } from 'react';
import { BarcodeIcon } from 'lucide-react';
import FormInput from '../../../../components/FormInput';
import Input from '../../../../components/Input';
import { Button, CollapsibleSection } from '../../../../components';
import CameraBarcodeScanner from '../../../../components/scanner/CameraBarcodeScanner';
import { type ScannerResult } from '../../../../services/barcode-scanner.service';
import { useScannerFeedback } from '../../../../hooks/useScannerSettings';

interface BarcodeFieldsProps {
    fieldPrefix: string;
    isNewVariant?: boolean;
    getValue: (field: string) => string;
    onChange: (field: string, value: string) => void;
    hasData?: boolean;
}

const BarcodeFields: FunctionComponent<BarcodeFieldsProps> = ({
    fieldPrefix,
    isNewVariant = false,
    getValue,
    onChange,
    hasData = false,
}) => {
    const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
    const { triggerFeedback } = useScannerFeedback();

    const handleBarcodeChange = (value: string) => {
        const cleanedValue = value.endsWith('$') ? value.slice(0, -1) : value;
        onChange('barcode', cleanedValue);
    };

    const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    return (
        <CollapsibleSection
            title="Barcode?"
            icon={<BarcodeIcon className="w-4 h-4" />}
            defaultOpen={hasData}
        >
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        {isNewVariant ? (
                            <div className="space-y-1">
                                <Input
                                    value={getValue('barcode')}
                                    onChange={(e) => {
                                        onChange('barcode', e.target.value);
                                        handleBarcodeChange(e.target.value);
                                    }}
                                    placeholder="Scan or enter"
                                    onKeyDown={handleBarcodeKeyDown}
                                />
                            </div>
                        ) : (
                            <FormInput
                                name={`${fieldPrefix}.barcode`}
                                placeholder="Scan or enter"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    handleBarcodeChange(e.target.value);
                                }}
                                onKeyDown={handleBarcodeKeyDown}
                            />
                        )}
                    </div>
                    <Button
                        type="button"
                        onClick={() => setIsBarcodeScannerOpen(true)}
                    >
                        Scan
                    </Button>
                </div>

                <CameraBarcodeScanner
                    isOpen={isBarcodeScannerOpen}
                    onClose={() => setIsBarcodeScannerOpen(false)}
                    onScan={(result: ScannerResult) => {
                        triggerFeedback();
                        onChange('barcode', result.barcode);
                        setIsBarcodeScannerOpen(false);
                    }}
                    continuous={false}
                    title="Scan Barcode"
                    subtitle="Point camera at barcode"
                />
            </div>
        </CollapsibleSection>
    );
};

export default BarcodeFields;
