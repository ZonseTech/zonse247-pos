import { FC, useState, useRef, useCallback } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ScrollArea, Text, Flex, IconButton, Spinner } from '@radix-ui/themes';
import { Search, X, Package } from 'lucide-react';
import { productService } from '../../../services';

export interface SelectedVariant {
    id: string;
    inventoryId: string;
    name: string;
    variantName: string;
    sku: string;
    availableQuantity: number;
    reservedQuantity: number;
    damagedQuantity: number;
    averageCost: number;
}

interface ProductVariantPickerProps {
    selected: SelectedVariant | null;
    onSelect: (variant: SelectedVariant | null) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
}

const ProductVariantPicker: FC<ProductVariantPickerProps> = ({
    selected,
    onSelect,
    label = 'Product',
    placeholder = 'Search by name or SKU...',
    disabled = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<ProductWithInventory[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const searchProducts = useCallback(async (term: string) => {
        if (!term || term.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }
        setIsSearching(true);
        try {
            const result = await productService.listProducts({
                search: term,
                limit: 15,
                page: 1,
            });
            setResults(result.products || []);
            setIsOpen(true);
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchProducts(value), 300);
    };

    const handleSelect = (product: ProductWithInventory) => {
        onSelect({
            id: product.id,
            inventoryId: product.inventory?.inventoryId || product.id,
            name: product.name,
            variantName: product.variantName || 'Default',
            sku: product.sku || '',
            availableQuantity: product.inventory?.availableQuantity ?? 0,
            reservedQuantity: product.inventory?.reservedQuantity ?? 0,
            damagedQuantity: product.inventory?.damagedQuantity ?? 0,
            averageCost: product.inventory?.averageCost ?? 0,
        });
        setSearchTerm('');
        setResults([]);
        setIsOpen(false);
    };

    const handleClear = () => {
        onSelect(null);
        setSearchTerm('');
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    if (selected) {
        return (
            <div>
                {label && (
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        {label}
                    </label>
                )}
                <Flex align="center" gap="3" className="p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
                    <div className="p-2 bg-sky-100 dark:bg-sky-900/40 rounded-lg flex-shrink-0">
                        <Package className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Text as="p" size="2" weight="medium" className="text-gray-900 dark:text-white truncate">
                            {selected.name}
                        </Text>
                        <Text as="p" size="1" className="text-gray-500 dark:text-gray-400">
                            {selected.variantName}
                            {selected.sku && ` · ${selected.sku}`}
                            {' · Stock: '}
                            <Text weight="bold">{selected.availableQuantity}</Text>
                        </Text>
                    </div>
                    {!disabled && (
                        <IconButton
                            variant="ghost"
                            size="1"
                            color="gray"
                            onClick={handleClear}
                            className="flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </IconButton>
                    )}
                </Flex>
            </div>
        );
    }

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <div>
                {label && (
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        {label}
                    </label>
                )}
                <Popover.Anchor asChild>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => results.length > 0 && setIsOpen(true)}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="w-full pl-9 pr-9 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-colors disabled:opacity-50"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Spinner size="1" />
                            </div>
                        )}
                    </div>
                </Popover.Anchor>
            </div>

            <Popover.Portal>
                <Popover.Content
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => {
                        if (inputRef.current?.contains(e.target as Node)) {
                            e.preventDefault();
                        }
                    }}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-50 w-[var(--radix-popover-trigger-width)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                >
                    {results.length > 0 ? (
                        <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: 240 }}>
                            {results.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => handleSelect(product)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
                                >
                                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                                        <Package className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text as="p" size="2" weight="medium" className="text-gray-900 dark:text-gray-100 truncate">
                                            {product.name}
                                        </Text>
                                        <Text as="p" size="1" className="text-gray-500 dark:text-gray-400 truncate">
                                            {product.variantName || 'Default'}
                                            {product.sku && ` · ${product.sku}`}
                                        </Text>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <Text as="p" size="2" weight="bold" className="text-gray-900 dark:text-white">
                                            {product.inventory?.availableQuantity ?? 0}
                                        </Text>
                                        <Text as="p" size="1" className="text-gray-500 dark:text-gray-400">in stock</Text>
                                    </div>
                                </button>
                            ))}
                        </ScrollArea>
                    ) : searchTerm.length >= 2 && !isSearching ? (
                        <Flex direction="column" align="center" gap="2" className="p-4">
                            <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            <Text size="2" className="text-gray-500 dark:text-gray-400">No products found</Text>
                        </Flex>
                    ) : null}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};

export default ProductVariantPicker;
