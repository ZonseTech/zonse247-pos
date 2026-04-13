import { FunctionComponent, useState, useMemo, useEffect } from 'react';
import { Package } from 'lucide-react';
import { Flex, Text, Box, ScrollArea, SegmentedControl } from '@radix-ui/themes';
import { SearchBar } from '../../../components/SearchBar';
import { CategoryFilter } from '../../inventory/partials/CategoryFilter';
import { formatCurrency } from '../../../utils';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchInventory } from '../../../store/slices/inventorySlice';
import classNames from 'classnames';

type CatalogMode = 'services' | 'all';

interface ServiceCatalogPanelProps {
    categories: Category[];
    onAddToCart: (item: InventoryItem) => void;
    compact?: boolean;
}

const ServiceCatalogPanel: FunctionComponent<ServiceCatalogPanelProps> = ({
    categories,
    onAddToCart,
    compact = false,
}) => {
    const dispatch = useAppDispatch();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [catalogMode, setCatalogMode] = useLocalStorage<CatalogMode>('pos-catalog-mode', 'services');

    // Services from Redux store (loaded on auth by DataManager)
    const services = useAppSelector((state) => state.services.items);
    const servicesLoading = useAppSelector((state) => state.services.loading);

    // Products from Redux store (may not be loaded yet for service-only businesses)
    const inventory = useAppSelector((state) => state.inventory.inventory);
    const inventoryLoading = useAppSelector((state) => state.inventory.loading);
    const inventoryLastFetched = useAppSelector((state) => state.inventory.lastFetched);

    // Lazy-load products only when user switches to "all" mode
    useEffect(() => {
        if (catalogMode === 'all' && !inventoryLastFetched && !inventoryLoading) {
            dispatch(fetchInventory({}));
        }
    }, [catalogMode, inventoryLastFetched, inventoryLoading, dispatch]);

    // Products only (items that track inventory) — used in "All" mode
    const products = useMemo(() => {
        if (catalogMode !== 'all') return [];
        return inventory.filter(item => {
            if (item.trackInventory === false) return false;
            if (item.expirationDate && new Date(item.expirationDate) < new Date()) return false;
            if (item.status && item.status.toUpperCase() === 'OUT_OF_STOCK') return false;
            const quantity = parseFloat((item.quantity || item.availableQuantity || 0).toString());
            if (quantity <= 0 && !item.isDefault) return false;
            return true;
        });
    }, [inventory, catalogMode]);

    const filteredItems = useMemo(() => {
        // "services" mode: only services from Redux store
        // "all" mode: services + products from Redux store
        let items = catalogMode === 'services'
            ? services
            : [...services, ...products];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            items = items.filter(item => {
                const name = (item.displayName || item.name || '').toLowerCase();
                const sku = (item.sku || '').toLowerCase();
                const barcode = (item.barcode || item.primaryBarcode || '').toLowerCase();
                return name.includes(term) || sku.includes(term) || barcode.includes(term);
            });
        }

        if (selectedCategory && selectedCategory !== 'all') {
            items = items.filter(item => item.categoryId === selectedCategory);
        }

        return items;
    }, [services, products, selectedCategory, searchTerm, catalogMode]);

    const isSearching = searchTerm.trim().length > 0;
    const DISPLAY_LIMIT = compact ? 12 : 18;
    const displayItems = isSearching ? filteredItems : filteredItems.slice(0, DISPLAY_LIMIT);

    const isLoading = servicesLoading || (catalogMode === 'all' && inventoryLoading);

    return (
        <Flex direction="column" height="100%" overflow="hidden">
            {/* Search + Mode Switch */}
            <Box
                flexShrink="0"
                px={compact ? '2' : '3'}
                pt={compact ? '2' : '3'}
                pb={compact ? '1' : '2'}
                className="border-b border-gray-200 dark:border-gray-700"
            >
                <Flex align="center" gap="2">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder={catalogMode === 'services' ? 'Search services...' : 'Search item...'}
                        compact={compact}
                        className="flex-1 min-w-0"
                    />
                    <SegmentedControl.Root
                        size={compact ? '1' : '2'}
                        value={catalogMode}
                        onValueChange={(value) => setCatalogMode(value as CatalogMode)}
                    >
                        <SegmentedControl.Item value="services">Services</SegmentedControl.Item>
                        <SegmentedControl.Item value="all">All</SegmentedControl.Item>
                    </SegmentedControl.Root>
                </Flex>
            </Box>

            {/* Category Filter */}
            <Box
                flexShrink="0"
                px={compact ? '2' : '3'}
                py={compact ? '1' : '2'}
                className="border-b border-gray-200 dark:border-gray-700"
            >
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onChange={setSelectedCategory}
                    categories={categories}
                />
            </Box>

            {/* Item Grid */}
            <ScrollArea scrollbars="vertical" className="flex-1 min-h-0">
                {displayItems.length > 0 ? (
                    <div className={classNames(
                        "grid gap-2",
                        compact ? "grid-cols-2 p-1.5" : "grid-cols-2 lg:grid-cols-3 p-3"
                    )}>
                        {displayItems.map((item) => {
                            const displayName = item.displayName || item.name;
                            const price = parseFloat((item.sellingPrice || 0).toString());
                            const isProduct = item.trackInventory !== false;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onAddToCart(item)}
                                    className={classNames(
                                        "flex flex-col items-start text-left rounded-md border transition-all duration-150",
                                        "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
                                        "hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-600",
                                        "focus:outline-none focus:ring-2 focus:ring-sky-500",
                                        compact ? "p-2" : "p-3"
                                    )}
                                >
                                    <Flex align="center" gap="1" width="100%">
                                        <Text
                                            size={compact ? '1' : '2'}
                                            weight="medium"
                                            className="text-gray-800 dark:text-gray-100 line-clamp-2 flex-1"
                                        >
                                            {displayName}
                                        </Text>
                                        {isProduct && (
                                            <Text size="1" className="text-amber-600 dark:text-amber-400 flex-shrink-0">
                                                <Package size={compact ? 10 : 12} />
                                            </Text>
                                        )}
                                    </Flex>
                                    {item.categoryDetails?.name && (
                                        <Text
                                            size="1"
                                            color="gray"
                                            mt="1"
                                            className="truncate max-w-full"
                                        >
                                            {item.categoryDetails.name}
                                        </Text>
                                    )}
                                    <Text
                                        size={compact ? '1' : '2'}
                                        weight="bold"
                                        mt="1"
                                        className="text-sky-600 dark:text-sky-400"
                                    >
                                        {formatCurrency(price)}
                                    </Text>
                                </button>
                            );
                        })}
                    </div>
                ) : null}

                {displayItems.length === 0 && (
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        height="100%"
                        px="4"
                        className="text-gray-500 dark:text-gray-400"
                    >
                        <Package className={classNames(
                            "mb-3 text-gray-300 dark:text-gray-600",
                            compact ? "w-8 h-8" : "w-12 h-12"
                        )} />
                        <Text size={compact ? '1' : '2'} align="center">
                            {isLoading
                                ? catalogMode === 'all' ? 'Loading items...' : 'Loading services...'
                                : selectedCategory !== 'all'
                                    ? 'No items in this category'
                                    : searchTerm.trim()
                                        ? 'No items match your search'
                                        : catalogMode === 'services'
                                            ? 'No services available'
                                            : 'No sellable items available'}
                        </Text>
                    </Flex>
                )}
            </ScrollArea>
        </Flex>
    );
};

export default ServiceCatalogPanel;
