import { Button, Dialog, Flex, Text, TextArea, TextField } from '@radix-ui/themes';
import { formatCurrency } from '../../../utils';
import { FileSpreadsheet } from 'lucide-react';
import { useState, useCallback, FC, useMemo } from 'react';
import ProductVariantPicker, { type SelectedVariant } from '../../stock-movements/partials/ProductVariantPicker';

interface OpeningBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        inventoryId: string;
        quantity: number;
        unitCost: number;
        openingDate?: string;
        notes?: string;
    }) => Promise<any>;
}

const OpeningBalanceModal: FC<OpeningBalanceModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [notes, setNotes] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [openingDate, setOpeningDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<SelectedVariant | null>(null);

    const resetForm = useCallback(() => {
        setSelected(null);
        setQuantity('');
        setUnitCost('');
        setOpeningDate('');
        setNotes('');
    }, []);

    const handleOpenChange = useCallback((open: boolean) => {
        if (!open) {
            resetForm();
            onClose();
        }
    }, [resetForm, onClose]);

    const qty = parseFloat(quantity) || 0;
    const cost = parseFloat(unitCost) || 0;
    const totalValue = useMemo(() => qty * cost, [qty, cost]);
    const isValid = selected && qty > 0 && cost > 0;

    const handleSubmit = async () => {
        if (!isValid) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                inventoryId: selected.inventoryId,
                quantity: qty,
                unitCost: cost,
                openingDate: openingDate || undefined,
                notes: notes.trim() || undefined,
            });
            resetForm();
            onClose();
        } catch {
            // Error handled by hook (Notify.failure)
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Dialog.Content
                maxWidth="448px"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <Dialog.Title>
                    <Flex align="center" gap="3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        Opening Balance
                    </Flex>
                </Dialog.Title>
                <Dialog.Description size="1" color="gray">
                    {selected
                        ? <>{selected.name} — <strong>{selected.variantName}</strong></>
                        : 'Record initial stock with unit cost'}
                </Dialog.Description>

                <div className="space-y-4 py-4">
                    <ProductVariantPicker selected={selected} onSelect={setSelected} label="Product / Variant" />

                    {selected && (
                        <>
                            <div>
                                <Text as="label" size="2" weight="medium">
                                    Quantity <span className="text-red-500">*</span>
                                </Text>
                                <TextField.Root
                                    type="number"
                                    min={0.01}
                                    step="any"
                                    size="2"
                                    mt="1"
                                    value={quantity}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                                    placeholder="Enter opening quantity"
                                />
                            </div>

                            <div>
                                <Text as="label" size="2" weight="medium">
                                    Unit Cost (MK) <span className="text-red-500">*</span>
                                </Text>
                                <TextField.Root
                                    type="number"
                                    min={0.01}
                                    step="any"
                                    size="2"
                                    mt="1"
                                    value={unitCost}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnitCost(e.target.value)}
                                    placeholder="Cost per unit"
                                />
                            </div>

                            <div>
                                <Text as="label" size="2" weight="medium">Opening Date (optional)</Text>
                                <TextField.Root
                                    type="date"
                                    size="2"
                                    mt="1"
                                    value={openingDate}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpeningDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <Text as="label" size="2" weight="medium">Notes (optional)</Text>
                                <TextArea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional details about the opening balance..."
                                    rows={2}
                                    size="2"
                                    mt="1"
                                    resize="none"
                                />
                            </div>

                            {qty > 0 && cost > 0 && (
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-emerald-500 dark:text-emerald-400 font-medium">
                                                Total Value
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {qty.toLocaleString()} × {formatCurrency(cost, true)}
                                            </p>
                                        </div>
                                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                                            {formatCurrency(totalValue, true)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button color="gray" variant="soft" size="2">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Button
                        size="2"
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        loading={isSubmitting}
                    >
                        Record Balance
                    </Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default OpeningBalanceModal;
