import { FunctionComponent, RefObject } from 'react';
import Panel from '../../../components/Panel';
import BarcodeScanner from '../partials/BarcodeScanner';
import FunctionButtons from '../partials/FunctionButtons';
import CustomerSelector from '../../customers/partials/CustomerSelector';
import SaleDateField from '../partials/SaleDateField';
import classNames from 'classnames';
import type { POSLayoutConfig } from '../hooks/usePOSLayout';
import type { useFocusManager } from '../../../hooks/useFocusManager';
import { CHECKOUT, type PaymentMethod } from '../partials/CheckoutModal';
import { useAuth } from '../../../context/AuthProvider';
import { useInventory } from '../../../hooks/useInventory';
import { hasPermission } from '../../../utils';

interface ActionBarProps {
    layout: POSLayoutConfig;
    focusManager: ReturnType<typeof useFocusManager>;
    barcodeScannerInputRef: RefObject<HTMLInputElement | null>;
    numpadInput: string;
    cartItemCount: number;
    onNumpadInputProcessed: () => void;
    onVoidSale: () => void;
    onParkSale: () => void;
    onParkedSales: () => void;
    onOpenDrawer: () => void;
    onItemLookup: () => void;
    onReprint: () => void;
    onDiscount: () => void;
    onMultiplePayment: () => void;
    onCompleteTransaction: (method: PaymentMethod) => void;
    hasActiveOrder?: boolean;
}

const ActionBar: FunctionComponent<ActionBarProps> = ({
    layout,
    focusManager,
    barcodeScannerInputRef,
    numpadInput,
    cartItemCount,
    onNumpadInputProcessed,
    onVoidSale,
    onParkSale,
    onParkedSales,
    onOpenDrawer,
    onItemLookup,
    onReprint,
    onDiscount,
    onMultiplePayment,
    onCompleteTransaction,
    hasActiveOrder,
}) => {
    const { compact, isSidebarVisible } = layout;
    const { user } = useAuth();
    const { saleDate, setSaleDate } = useInventory();
    const canBackdateSale = hasPermission(user, 'sales.edit');

    const showScannerInBar = !layout.showCatalog;

    return (
        <div className={classNames(
            "fixed bottom-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30 transition-all duration-300",
            isSidebarVisible ? "left-0 md:left-64" : "left-0",
            compact ? "pb-2" : "pb-4"
        )}>
            {showScannerInBar && (
                <div className={classNames(
                    "flex gap-x-2 lg:gap-x-4",
                    compact ? "px-2 py-1" : "px-2 lg:px-4 py-3"
                )}>
                    {/* Product Scanner */}
                    <Panel size={layout.footer.scanner} className="w-full">
                        <div className={classNames(
                            "flex items-center gap-2",
                            compact ? "mb-0.5" : "mb-0.5 lg:mb-1"
                        )}>
                            <label className={classNames(
                                "block font-bold text-black dark:text-gray-400 flex-1",
                                compact ? "text-xs" : "text-base lg:text-lg"
                            )}>
                                SCAN/ENTER PRODUCT CODE
                            </label>
                            {canBackdateSale && (
                                <div className="block">
                                    <SaleDateField value={saleDate} onChange={setSaleDate} compact />
                                </div>
                            )}
                            <div className="block">
                                <CustomerSelector compact={compact} />
                            </div>
                        </div>
                        <BarcodeScanner
                            externalInput={numpadInput}
                            barcodeScannerInputRef={barcodeScannerInputRef}
                            onExternalInputProcessed={onNumpadInputProcessed}
                            focusManager={focusManager}
                            compact={compact}
                        />
                    </Panel>

                    {/* Item Counter */}
                    <Panel size={layout.footer.counter} className="flex">
                        <label className={classNames(
                            "block font-bold text-black dark:text-gray-400",
                            compact ? "text-xs mb-0.5" : "text-base lg:text-lg mb-0.5 lg:mb-1"
                        )}>
                            TOTAL NUMBER OF ITEMS
                        </label>
                        <div className={classNames(
                            "bg-gray-800 text-white font-bold text-center",
                            compact ? "text-sm py-2" : "text-lg lg:text-xl py-2 lg:py-2.5"
                        )}>
                            {cartItemCount}
                        </div>
                    </Panel>
                </div>
            )}

            {/* Function Buttons */}
            <Panel size="full" className={classNames(
                "border-0 shadow-none",
                compact ? "px-2 pb-1" : "px-2 lg:px-4",
                !showScannerInBar && (compact ? "pt-2" : "pt-3")
            )}>
                <FunctionButtons
                    onVoidSale={onVoidSale}
                    onParkSale={onParkSale}
                    onParkedSales={onParkedSales}
                    onOpenDrawer={onOpenDrawer}
                    onItemLookup={onItemLookup}
                    onReprint={onReprint}
                    onDiscount={onDiscount}
                    onMultiplePayment={onMultiplePayment}
                    onBankTransfer={() => onCompleteTransaction(CHECKOUT.BANK_TRANSFER)}
                    onEPayment={() => onCompleteTransaction(CHECKOUT.E_PAYMENT)}
                    onPayCash={() => onCompleteTransaction(CHECKOUT.CASH)}
                    compact={compact}
                    serviceMode={layout.showCatalog}
                    hasActiveOrder={hasActiveOrder}
                />
            </Panel>
        </div>
    );
};

export default ActionBar;
