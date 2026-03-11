import MobileTabPageHeader from '../../components/page/MobileTabPageHeader';
import MobileItemTile from './partials/MobileItemTile';
import CustomerSelector from '../customers/partials/CustomerSelector';
import { CameraBarcodeScanner } from '../../components';
import { MobileItemLookupModal } from '../../components/modals';
import { FunctionComponent, useState, useEffect } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { HiSearch, HiUserAdd } from 'react-icons/hi';
import { TbLayoutGrid } from 'react-icons/tb';
import { BsUpcScan } from 'react-icons/bs';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { Package } from 'lucide-react';

const MobileStocks: FunctionComponent = () => {
    const { inventory, addToCart, removeFromCart, updateQuantity, cart } = useInventory();
    const navigate = useNavigate();

    const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
    const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<ApiProduct[]>([]);

    const {
        isLoading,
        data,
        totalRows,
        loadInventory,
        applyFilters,
    } = useInventoryManagement();

    useEffect(() => {
        loadInventory();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm) {
                applyFilters({ search: searchTerm });
            } else {
                loadInventory();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleEdit = (item: ApiProduct) => {
        navigate(ROUTES.INVENTORY_FORM, { state: { productId: item.id } });
    };

    const handleDelete = (productId: string) => {
        console.log('Delete item:', productId);
    };

    const handleSelectItem = (item: ApiProduct, selected: boolean) => {
        if (selected) {
            setSelectedItems(prev => [...prev, item]);
        } else {
            setSelectedItems(prev => prev.filter(i => i.id !== item.id));
        }
    };

    const handleDisplayIconClick = () => {
        console.log('Display icon clicked - to be implemented');
    };

    const handleCameraScan = (result: { barcode: string }) => {
        if (result.barcode) {
            setIsCameraScannerOpen(false);
            const item = data.find(product =>
                product.variants?.some(v => v.primaryBarcode === result.barcode)
            );
            if (item) {
                handleEdit(item);
            }
        }
    };

    const handleAddToCartFromLookup = (item: InventoryItem | ApiProduct, variant?: ProductVariant) => {
        if ('variants' in item) {
            const selectedVariant = variant || item.variants?.find(v => v.isDefault) || item.variants?.[0];
            const cartItem: InventoryItem = {
                id: selectedVariant?.id || item.id,
                productId: item.id,
                branchId: item.branchId,
                tenantId: item.tenantId,
                userId: '',
                categoryId: item.categoryId || '',
                barcode: selectedVariant?.primaryBarcode || '',
                sku: selectedVariant?.sku || '',
                name: selectedVariant?.variantName && selectedVariant.variantName !== 'Default'
                    ? `${item.name} - ${selectedVariant.variantName}`
                    : item.name,
                description: selectedVariant?.description || item.description || '',
                brand: selectedVariant?.brand || item.brand || '',
                unit: selectedVariant?.unit || item.defaultUnit,
                costPrice: selectedVariant?.costPrice || 0,
                sellingPrice: selectedVariant?.sellingPrice || 0,
                quantity: String(selectedVariant?.inventory?.availableQuantity ?? 0),
                originalQuantity: String(selectedVariant?.inventory?.availableQuantity ?? 0),
                expiryDateAlert: '',
                categoryDetails: item.categoryDetails as Category | undefined,
            };
            addToCart(cartItem);
        } else {
            addToCart(item);
        }
    };

    const handleRemoveFromCart = (item: InventoryItem | ApiProduct, variant?: ProductVariant) => {
        if ('variants' in item) {
            const selectedVariant = variant || item.variants?.find(v => v.isDefault) || item.variants?.[0];
            const variantId = selectedVariant?.id || item.id;

            const cartItem = cart.find(ci => ci.variantId === variantId);
            if (cartItem) {
                if (cartItem.quantity > 1) {
                    updateQuantity(variantId, cartItem.quantity - 1);
                } else {
                    removeFromCart(variantId);
                }
            }
        } else {
            const variantId = item.id || item.productId;
            const cartItem = cart.find(ci => ci.variantId === variantId);
            if (cartItem) {
                if (cartItem.quantity > 1) {
                    updateQuantity(variantId, cartItem.quantity - 1);
                } else {
                    removeFromCart(variantId);
                }
            }
        }
    };

    const handleSetCartQuantity = (item: ApiProduct, variant: ProductVariant, quantity: number) => {
        const variantId = variant.id;
        const existingCartItem = cart.find(ci => ci.variantId === variantId);

        if (quantity <= 0) {
            if (existingCartItem) {
                removeFromCart(variantId);
            }
        } else if (existingCartItem) {
            updateQuantity(variantId, quantity);
        } else {
            const cartItem: InventoryItem = {
                id: variantId,
                productId: item.id,
                branchId: item.branchId,
                tenantId: item.tenantId,
                userId: '',
                categoryId: item.categoryId || '',
                barcode: variant.primaryBarcode || '',
                sku: variant.sku || '',
                name: variant.variantName && variant.variantName !== 'Default'
                    ? `${item.name} - ${variant.variantName}`
                    : item.name,
                description: variant.description || item.description || '',
                brand: variant.brand || item.brand || '',
                unit: variant.unit || item.defaultUnit,
                costPrice: variant.costPrice || 0,
                sellingPrice: variant.sellingPrice || 0,
                quantity: String(variant.inventory?.availableQuantity ?? 0),
                originalQuantity: String(variant.inventory?.availableQuantity ?? 0),
                expiryDateAlert: '',
                categoryDetails: item.categoryDetails as Category | undefined,
            };
            addToCart(cartItem);
            if (quantity > 1) {
                setTimeout(() => updateQuantity(variantId, quantity), 10);
            }
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobileTabPageHeader
                    rightContent={
                        <div className="flex gap-4 items-center">
                            <TbLayoutGrid
                                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                                onClick={handleDisplayIconClick}
                            />
                            <CustomerSelector
                                trigger={
                                    <HiUserAdd className="w-6 h-6 text-white active:scale-95 transition-transform" />
                                }
                            />
                        </div>
                    }
                >
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => setIsLookupModalOpen(true)}
                            className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 rounded-sm transition-colors border border-gray-200 dark:border-gray-700"
                        >
                            <HiSearch className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400 font-light">Item Lookup</span>
                        </button>
                        <button
                            onClick={() => setIsCameraScannerOpen(true)}
                            className="p-2.5 bg-white dark:bg-gray-800 rounded-sm transition-colors border border-gray-200 dark:border-gray-700"
                            aria-label="Open camera scanner"
                        >
                            <BsUpcScan className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                        </button>
                    </div>
                </MobileTabPageHeader>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden pt-[108px]">
                <div className="h-full overflow-y-auto pb-40 p-4">
                    {data.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No items found
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {searchTerm
                                    ? `No results for "${searchTerm}"`
                                    : 'Your inventory is empty. Add some items to get started.'}
                            </p>
                        </div>
                    ) : (
                        <MobileItemTile
                            data={data}
                            isLoading={isLoading}
                            searchTerm={searchTerm}
                            selectedItems={selectedItems}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSelectItem={handleSelectItem}
                            totalRows={totalRows}
                            onAddToCart={handleAddToCartFromLookup}
                            onRemoveFromCart={handleRemoveFromCart}
                            onSetCartQuantity={handleSetCartQuantity}
                            onNewItem={() => navigate(ROUTES.INVENTORY_FORM)}
                        />
                    )}
                </div>
            </div>

            <CameraBarcodeScanner
                isOpen={isCameraScannerOpen}
                onClose={() => setIsCameraScannerOpen(false)}
                onScan={handleCameraScan}
                title="Scan Product"
                subtitle="Point camera at product barcode"
            />

            <MobileItemLookupModal
                isOpen={isLookupModalOpen}
                onClose={() => setIsLookupModalOpen(false)}
                inventory={inventory}
                onAddToCart={handleAddToCartFromLookup}
                onOpenScanner={() => setIsCameraScannerOpen(true)}
                multiSelect
            />
        </div>
    );
};

export default MobileStocks;
