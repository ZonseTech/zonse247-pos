import { useState, useEffect, FC, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Package, Search, X, AlertTriangle, Check, ArrowRight, Layers } from 'lucide-react';
import { Button, Input, Label } from '../../../components';
import { useInventoryActions } from '../../../hooks/useInventoryActions';
import { useInventoryManagement } from '../../../hooks/useInventoryManagement';

interface ConvertToVariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ApiProduct | null;
    onSuccess: () => void;
}

const ConvertToVariantModal: FC<ConvertToVariantModalProps> = ({ isOpen, onClose, item, onSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [variantName, setVariantName] = useState('');
    const [deleteOrphanedProduct, setDeleteOrphanedProduct] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [isVariantDropdownOpen, setIsVariantDropdownOpen] = useState(false);
    const [step, setStep] = useState<'select-variant' | 'search' | 'confirm'>('select-variant');

    const { convertToVariant, isLoading } = useInventoryActions();
    const { data: products, handleSearch, loadInventory, isLoading: productsLoading } = useInventoryManagement();

    const variants = useMemo(() => item?.variants || [], [item]);
    const hasMultipleVariants = variants.length > 1;

    const selectedVariant = useMemo(() => {
        if (!selectedVariantId) {
            return variants.find(v => v.isDefault) || variants[0];
        }
        return variants.find(v => v.id === selectedVariantId);
    }, [variants, selectedVariantId]);

    const availableProducts = useMemo(() => {
        if (!item) return products;
        return products.filter(p => p.id !== item.id);
    }, [products, item]);

    useEffect(() => {
        if (isOpen) {
            loadInventory();
        }
    }, [isOpen]);

    useEffect(() => {
        if (item && variants.length > 0) {
            const defaultVariant = variants.find(v => v.isDefault) || variants[0];
            setSelectedVariantId(defaultVariant?.id || null);
            setVariantName(defaultVariant?.variantName || item.name);
            setStep(hasMultipleVariants ? 'select-variant' : 'search');
        }
    }, [item, variants, hasMultipleVariants]);

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && resetAndClose();
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Update variant name when selected variant changes
    useEffect(() => {
        if (selectedVariant) {
            setVariantName(selectedVariant.variantName || item?.name || '');
        }
    }, [selectedVariant, item]);

    const resetAndClose = () => {
        setSearchTerm('');
        setVariantName('');
        setSelectedProduct(null);
        setSelectedVariantId(null);
        setDeleteOrphanedProduct(true);
        setIsVariantDropdownOpen(false);
        setStep(hasMultipleVariants ? 'select-variant' : 'search');
        onClose();
    };

    const handleSearchChange = useCallback((term: string) => {
        setSearchTerm(term);
        handleSearch(term);
    }, [handleSearch]);

    const handleSelectProduct = useCallback((product: ApiProduct) => {
        setSelectedProduct(product);
        setStep('confirm');
    }, []);

    const handleBack = useCallback(() => {
        if (step === 'confirm') {
            setStep('search');
            setSelectedProduct(null);
        } else if (step === 'search' && hasMultipleVariants) {
            setStep('select-variant');
        }
    }, [step, hasMultipleVariants]);

    const handleContinueToSearch = useCallback(() => {
        setStep('search');
    }, []);

    const handleSubmit = async () => {
        if (!item || !selectedProduct || !selectedVariant) return;

        try {
            await convertToVariant(selectedVariant.id, {
                targetProductId: selectedProduct.id,
                variantName: variantName || undefined,
                deleteOrphanedProduct,
            });
            onSuccess();
            resetAndClose();
        } catch (error) {
            console.error('Failed to convert to variant:', error);
        }
    };

    if (!isOpen || !item) return null;

    const currentQuantity = selectedVariant?.inventory?.availableQuantity ?? 0;

    const getDefaultVariant = (product: ApiProduct): ProductVariant | undefined => {
        return product.variants?.find(v => v.isDefault) || product.variants?.[0];
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && resetAndClose()}
        >
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                            <Layers className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Convert to Variant
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {step === 'select-variant'
                                    ? 'Select which variant to move'
                                    : 'Move this variant to another product'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={resetAndClose}
                        className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                    {/* Source Product Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                            <Package className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                            {!hasMultipleVariants && selectedVariant && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Stock: <span className="font-semibold">{currentQuantity}</span>
                                    {selectedVariant?.sku && <span className="ml-2">SKU: {selectedVariant.sku}</span>}
                                </p>
                            )}
                            {hasMultipleVariants && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {variants.length} variants available
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Step 1: Variant Selection (only for multi-variant products) */}
                    {step === 'select-variant' && hasMultipleVariants && (
                        <>
                            <div>
                                <Label>Select Variant to Convert</Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Choose which variant you want to move to another product.
                                </p>
                            </div>

                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="max-h-64 overflow-y-auto">
                                    {variants.map((variant) => {
                                        const isSelected = selectedVariantId === variant.id;
                                        const qty = variant.inventory?.availableQuantity ?? 0;

                                        return (
                                            <button
                                                key={variant.id}
                                                type="button"
                                                onClick={() => setSelectedVariantId(variant.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-0 ${isSelected ? 'bg-sky-50 dark:bg-sky-900/20' : ''
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                                                    ? 'border-sky-500 bg-sky-500'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-gray-900 dark:text-gray-100'
                                                        }`}>
                                                        {variant.variantName}
                                                        {variant.isDefault && (
                                                            <span className="ml-1.5 text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                                                                Default
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Stock: {qty}
                                                        {variant.sku && ` • SKU: ${variant.sku}`}
                                                        {variant.primaryBarcode && ` • ${variant.primaryBarcode}`}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 2: Search for target product */}
                    {step === 'search' && (
                        <>
                            {/* Selected Variant Info (for multi-variant products) */}
                            {hasMultipleVariants && selectedVariant && (
                                <div className="flex items-center gap-2 p-2.5 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                                    <Layers className="w-4 h-4 text-sky-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-sky-700 dark:text-sky-300 truncate">
                                            Moving: {selectedVariant.variantName}
                                        </p>
                                        <p className="text-xs text-sky-600 dark:text-sky-400">
                                            Stock: {currentQuantity}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Search */}
                            <div>
                                <Label>Search Target Product</Label>
                                <div className="relative mt-1.5">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder="Search by name, barcode, or SKU..."
                                        className="pl-10 w-full"
                                    />
                                </div>
                            </div>

                            {/* Product List */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="max-h-64 overflow-y-auto">
                                    {productsLoading ? (
                                        <div className="p-8 text-center">
                                            <div className="animate-spin w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full mx-auto"></div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading products...</p>
                                        </div>
                                    ) : availableProducts.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {searchTerm ? 'No matching products found' : 'No products available'}
                                            </p>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {availableProducts.map((product) => {
                                                const variant = getDefaultVariant(product);
                                                const qty = product.totalAvailableQuantity ?? 0;
                                                const variantCount = product.variantCount ?? 1;

                                                return (
                                                    <li
                                                        key={product.id}
                                                        onClick={() => handleSelectProduct(product)}
                                                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                    {product.name}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    {variant?.primaryBarcode && (
                                                                        <span className="font-mono">{variant.primaryBarcode}</span>
                                                                    )}
                                                                    <span>Stock: {qty}</span>
                                                                    {variantCount > 1 && (
                                                                        <span className="px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded">
                                                                            {variantCount} variants
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 'confirm' && selectedProduct && (
                        <>
                            {/* Target Product Info */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>Moving to:</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                                <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                                    <Layers className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{selectedProduct.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedProduct.variantCount ?? 1} variant(s) currently
                                    </p>
                                </div>
                            </div>

                            {/* Variant Name */}
                            <div>
                                <Label>Variant Name</Label>
                                <Input
                                    type="text"
                                    value={variantName}
                                    onChange={(e) => setVariantName(e.target.value)}
                                    placeholder="e.g., Large, Red, 500ml..."
                                    className="mt-1.5 w-full"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    This name will distinguish this variant from others under the same product.
                                </p>
                            </div>

                            {/* Delete Orphaned Product Option */}
                            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <input
                                    type="checkbox"
                                    id="deleteOrphaned"
                                    checked={deleteOrphanedProduct}
                                    onChange={(e) => setDeleteOrphanedProduct(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                />
                                <label htmlFor="deleteOrphaned" className="flex-1 cursor-pointer">
                                    <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                                        Delete original product if empty
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                        If this is the only variant, the original product "{item.name}" will be deleted.
                                    </p>
                                </label>
                            </div>

                            {/* Warning */}
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Historical records (sales, stock movements) will maintain their original references for reporting purposes.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    {step === 'select-variant' && (
                        <>
                            <Button theme="neutral" layout="outline" onClick={resetAndClose}>
                                Cancel
                            </Button>
                            <Button
                                theme="primary"
                                onClick={handleContinueToSearch}
                                disabled={!selectedVariantId}
                            >
                                Continue
                            </Button>
                        </>
                    )}
                    {step === 'search' && (
                        <>
                            <Button
                                theme="neutral"
                                layout="outline"
                                onClick={hasMultipleVariants ? handleBack : resetAndClose}
                            >
                                {hasMultipleVariants ? 'Back' : 'Cancel'}
                            </Button>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Select a product to continue
                            </p>
                        </>
                    )}
                    {step === 'confirm' && (
                        <>
                            <Button
                                theme="neutral"
                                layout="outline"
                                onClick={handleBack}
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                            <Button
                                theme="primary"
                                onClick={handleSubmit}
                                disabled={!selectedProduct || !selectedVariant || isLoading}
                                loading={isLoading}
                                icon={Check}
                            >
                                Convert
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConvertToVariantModal;
