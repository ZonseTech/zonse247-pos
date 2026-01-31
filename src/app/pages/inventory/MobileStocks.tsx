import MobilePageHeader from '../../components/page/MobilePageHeader';
import MobileInventoryList from './partials/MobileInventoryList';
import CustomerSelector from '../customers/partials/CustomerSelector';
import { CameraBarcodeScanner } from '../../components';
import { HelpModal, MobileItemLookupModal } from '../../components/modals';
import { FunctionComponent, useState, useEffect } from 'react';
import { useBranch } from '../../context/BranchContext';
import { useMobileNav } from '../../context/MobileNavContext';
import { useInventory } from '../../hooks/useInventory';
import BranchSwitchModal from '../../navigation/components/BranchSwitchModal';
import { HiOutlineChatAlt2, HiSearch, HiMenu } from 'react-icons/hi';
import { FaCaretDown } from 'react-icons/fa';
import { TbLayoutGrid } from 'react-icons/tb';
import { RiUserAddLine } from 'react-icons/ri';
import { BsUpcScan } from 'react-icons/bs';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { Package } from 'lucide-react';

const MobileStocks: FunctionComponent = () => {
    const { currentBranch } = useBranch();
    const { openDrawer } = useMobileNav();
    const { inventory, addToCart } = useInventory();
    const navigate = useNavigate();

    const [isBranchSwitchModalOpen, setIsBranchSwitchModalOpen] = useState(false);
    const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
    const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);

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

    // Handle search with debounce
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

    const handleEdit = (item: InventoryItem) => {
        navigate(ROUTES.INVENTORY_FORM, { state: { productId: item.productId } });
    };

    const handleDelete = (productId: string) => {
        // TODO: Implement delete functionality
        console.log('Delete item:', productId);
    };

    const handleSelectItem = (item: InventoryItem, selected: boolean) => {
        if (selected) {
            setSelectedItems(prev => [...prev, item]);
        } else {
            setSelectedItems(prev => prev.filter(i => i.productId !== item.productId));
        }
    };

    const handleDisplayIconClick = () => {
        // TODO: Implement display mode toggle (grid/list view)
        console.log('Display icon clicked - to be implemented');
    };

    const handleCameraScan = (result: { barcode: string }) => {
        if (result.barcode) {
            setIsCameraScannerOpen(false);
            // Find item by barcode and navigate to edit
            const item = inventory.find(i => i.barcode === result.barcode);
            if (item) {
                handleEdit(item);
            }
        }
    };

    const handleAddToCartFromLookup = (item: InventoryItem) => {
        addToCart(item);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    className='bg-sky-600 dark:bg-sky-700'
                    noBorder
                    showLeftButton={false}
                    title={
                        <div className="flex items-center gap-3">
                            <HiMenu
                                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                                onClick={openDrawer}
                            />
                            <button
                                onClick={() => setIsBranchSwitchModalOpen(true)}
                                className="flex items-center gap-1 rounded-sm active:scale-95 transition-all"
                            >
                                <span className="text-base font-semibold text-white truncate max-w-[180px]">
                                    {currentBranch?.branchName || 'Select Branch'}
                                </span>
                                <FaCaretDown className="w-4 h-4 text-sky-100 flex-shrink-0" />
                            </button>
                        </div>
                    }
                    rightContent={
                        <div className="flex gap-4 items-center">
                            <TbLayoutGrid
                                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                                onClick={handleDisplayIconClick}
                            />
                            <CustomerSelector
                                trigger={
                                    <RiUserAddLine className="w-6 h-6 text-white active:scale-95 transition-transform" />
                                }
                            />
                            <HiOutlineChatAlt2
                                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                                onClick={() => setIsHelpModalOpen(true)}
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
                            <BsUpcScan className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </MobilePageHeader>
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
                        <MobileInventoryList
                            data={data}
                            isLoading={isLoading}
                            searchTerm={searchTerm}
                            selectedItems={selectedItems}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSelectItem={handleSelectItem}
                            totalRows={totalRows}
                            onAddToCart={handleAddToCartFromLookup}
                            onNewItem={() => navigate(ROUTES.INVENTORY_FORM)}
                        />
                    )}
                </div>
            </div>

            <BranchSwitchModal
                isOpen={isBranchSwitchModalOpen}
                onClose={() => setIsBranchSwitchModalOpen(false)}
            />

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

            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
            />
        </div>
    );
};

export default MobileStocks;
