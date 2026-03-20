import { FC, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Package, Loader2 } from 'lucide-react';
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
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const inputWrapperRef = useRef<HTMLDivElement>(null);

    // Close on outside click (check both container and portal dropdown)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const insideContainer = containerRef.current?.contains(target);
            const insideDropdown = dropdownRef.current?.contains(target);
            if (!insideContainer && !insideDropdown) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Recompute dropdown position when open
    useEffect(() => {
        if (!isOpen || !inputWrapperRef.current) return;
        const updatePosition = () => {
            const rect = inputWrapperRef.current?.getBoundingClientRect();
            if (rect) {
                setDropdownPos({
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width,
                });
            }
        };
        updatePosition();
        // Also update on scroll/resize so it tracks the input
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

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

    // Dropdown content (rendered via portal to escape overflow clipping)
    const renderDropdown = () => {
        if (!isOpen) return null;

        const dropdownContent = results.length > 0 ? (
            <div
                ref={dropdownRef}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
                style={{
                    position: 'fixed',
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: dropdownPos.width,
                    zIndex: 99999,
                }}
            >
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
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {product.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {product.variantName || 'Default'}
                                {product.sku && ` · ${product.sku}`}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {product.inventory?.availableQuantity ?? 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">in stock</p>
                        </div>
                    </button>
                ))}
            </div>
        ) : searchTerm.length >= 2 && !isSearching ? (
            <div
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4 text-center"
                style={{
                    position: 'fixed',
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: dropdownPos.width,
                    zIndex: 99999,
                }}
            >
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No products found</p>
            </div>
        ) : null;

        if (!dropdownContent) return null;
        return createPortal(dropdownContent, document.body);
    };

    // Selected state — show product card with clear button
    if (selected) {
        return (
            <div>
                {label && (
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
                    <div className="p-2 bg-sky-100 dark:bg-sky-900/40 rounded-lg flex-shrink-0">
                        <Package className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {selected.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selected.variantName}
                            {selected.sku && ` · ${selected.sku}`}
                            {' · Stock: '}
                            <span className="font-semibold">{selected.availableQuantity}</span>
                        </p>
                    </div>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Search state — input with portal dropdown
    return (
        <div ref={containerRef}>
            {label && (
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    {label}
                </label>
            )}
            <div ref={inputWrapperRef} className="relative">
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
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
            </div>
            {renderDropdown()}
        </div>
    );
};

export default ProductVariantPicker;
