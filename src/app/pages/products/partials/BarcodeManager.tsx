import { FunctionComponent, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button, FormInput, Select } from '../../../components';

interface BarcodeManagerProps {
    barcodes: Omit<ProductBarcode, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[];
    onBarcodesChange: (barcodes: Omit<ProductBarcode, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[]) => void;
}

const BarcodeManager: FunctionComponent<BarcodeManagerProps> = ({ barcodes, onBarcodesChange }) => {
    const [newBarcode, setNewBarcode] = useState({
        barcode: '',
        barcodeType: 'CODE128' as BarcodeType,
        barcodeSource: 'STORE' as BarcodeSource,
        description: '',
    });

    const addBarcode = () => {
        if (!newBarcode.barcode) return;
        onBarcodesChange([...barcodes, newBarcode]);
        setNewBarcode({
            barcode: '',
            barcodeType: 'CODE128',
            barcodeSource: 'STORE',
            description: '',
        });
    };

    const removeBarcode = (index: number) => {
        onBarcodesChange(barcodes.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <FormInput
                        label="Barcode"
                        value={newBarcode.barcode}
                        onChange={(e) => setNewBarcode({ ...newBarcode, barcode: e.target.value })}
                        placeholder="Additional barcode"
                    />
                </div>
                <div className="w-40">
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <Select
                        value={newBarcode.barcodeType}
                        onChange={(e) => setNewBarcode({ ...newBarcode, barcodeType: e.target.value as BarcodeType })}
                    >
                        <option value="CODE128">CODE128</option>
                        <option value="EAN13">EAN13</option>
                        <option value="EAN8">EAN8</option>
                        <option value="UPC">UPC</option>
                        <option value="CODE39">CODE39</option>
                        <option value="QR">QR</option>
                    </Select>
                </div>
                <Button
                    type="button"
                    onClick={addBarcode}
                    size="small"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                </Button>
            </div>

            {barcodes.length > 0 && (
                <div className="border dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3">Additional Barcodes</h4>
                    <div className="space-y-2">
                        {barcodes.map((barcode, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <div>
                                    <div className="font-medium">{barcode.barcode}</div>
                                    <div className="text-xs text-gray-500">{barcode.barcodeType}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeBarcode(index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarcodeManager;
