import ItemLookupModal from './partials/ItemLookupModal';
import DiscountModal from './partials/DiscountModal';
import ReprintModal from './partials/ReprintModal';
import { FunctionComponent, useCallback } from 'react';
import CheckoutModal from './partials/CheckoutModal';
import MultiplePaymentModal from './partials/MultiplePaymentModal';
import ParkSaleModal from './partials/ParkSaleModal';
import ParkedSalesModal from './partials/ParkedSalesModal';
import CreateServiceOrderModal from './partials/CreateServiceOrderModal';
import ServiceOrdersListModal from './partials/ServiceOrdersListModal';
import Panel from '../../components/Panel';
import { useKeyboardSettings } from '../../hooks/useKeyboardSettings';
import { BalanceDueHeader, CartSection, ActionBar, ServiceInfoBar, ServiceCatalogPanel } from './sections';
import { usePOSController } from './hooks/usePOSController';
import { usePOSLayout, type POSLayoutConfig } from './hooks/usePOSLayout';
import { useServiceOrderManager } from './hooks/useServiceOrderManager';
import classNames from 'classnames';
import { useInventory } from '../../hooks/useInventory';

interface DesktopPOSProps {
    layoutOverrides?: Partial<POSLayoutConfig>;
}

const DesktopPOS: FunctionComponent<DesktopPOSProps> = ({ layoutOverrides }) => {
    const layout = usePOSLayout(layoutOverrides);
    const keyboardSettings = useKeyboardSettings();
    const isServiceLayout = layout.showCatalog;
    const { cart: currentCart, selectedCustomer } = useInventory();

    const serviceOrders = useServiceOrderManager({
        cart: currentCart,
        selectedCustomer,
    });

    const controller = usePOSController(isServiceLayout ? {
        onParkSaleOverride: serviceOrders.handleCreateOrder,
        onParkedSalesOverride: serviceOrders.handleServiceOrders,
        isServiceMode: true,
        activeServiceOrder: serviceOrders.activeServiceOrder,
        onQuickCheckout: serviceOrders.handleQuickCheckout,
    } : {});

    const {
        total,
        subtotal,
        discount,
        inventory,
        categories,
        cart,
        focusManager,
        barcodeScannerInputRef,
        numpadInput,
        customPriceInputs,
        paymentMethodId,
        modals,
        handleNumpadClick,
        handlePriceInputChange,
        handleNumpadInputProcessed,
        handleCompleteTransaction,
        handleVoidSale,
        handleParkSale,
        handleParkedSales,
        handleOpenDrawer,
        handleItemLookup,
        handleReprint,
        handleDiscount,
        handleMultiplePayment,
        handleAddToCartFromLookup,
    } = controller;

    const handleVoidWithOrderClear = useCallback(() => {
        handleVoidSale();
        serviceOrders.clearActiveOrder();
    }, [handleVoidSale, serviceOrders.clearActiveOrder]);

    return (
        <div className="absolute inset-0 flex flex-col overflow-hidden">
            {isServiceLayout ? (
                /* ── Service / Non-Retail Layout ── */
                <div className="flex-1 min-h-0 flex gap-x-2 lg:gap-x-4">
                    {/* Left Column: Header + Cart + Scanner */}
                    <div className={classNames(
                        "flex flex-col h-full",
                        layout.columns.left === '1/2' ? 'w-1/2' : `w-${layout.columns.left}`,
                        layout.compact ? "pb-32" : "pb-28"
                    )}>
                        <BalanceDueHeader
                            layout={layout}
                            total={total}
                            subtotal={subtotal}
                            discount={discount}
                        />

                        <CartSection
                            layout={layout}
                            focusManager={focusManager}
                            keyboardSettings={keyboardSettings}
                            customPriceInputs={customPriceInputs}
                            onPriceChange={handlePriceInputChange}
                            onNumpadClick={handleNumpadClick}
                            onStaffAssignmentsChange={serviceOrders.setStaffAssignments}
                        />

                        <ServiceInfoBar
                            cartItemCount={cart.length}
                            compact={layout.compact}
                            activeOrder={serviceOrders.activeServiceOrder}
                        />
                    </div>

                    {/* Right Column: Category filter + Product grid */}
                    <Panel size={layout.columns.right} className="h-full border-l border-gray-200 dark:border-gray-700">
                        <ServiceCatalogPanel
                            categories={categories}
                            onAddToCart={handleAddToCartFromLookup}
                            compact={layout.compact}
                        />
                    </Panel>
                </div>
            ) : (
                /* ── Retail Layout (original) ── */
                <>
                    <BalanceDueHeader
                        layout={layout}
                        total={total}
                        subtotal={subtotal}
                        discount={discount}
                    />

                    <CartSection
                        layout={layout}
                        focusManager={focusManager}
                        keyboardSettings={keyboardSettings}
                        customPriceInputs={customPriceInputs}
                        onPriceChange={handlePriceInputChange}
                        onNumpadClick={handleNumpadClick}
                    />
                </>
            )}

            <ActionBar
                layout={layout}
                focusManager={focusManager}
                barcodeScannerInputRef={barcodeScannerInputRef}
                numpadInput={numpadInput}
                cartItemCount={cart.length}
                onNumpadInputProcessed={handleNumpadInputProcessed}
                onVoidSale={handleVoidWithOrderClear}
                onParkSale={isServiceLayout ? serviceOrders.handleCreateOrder : handleParkSale}
                onParkedSales={isServiceLayout ? serviceOrders.handleServiceOrders : handleParkedSales}
                onOpenDrawer={handleOpenDrawer}
                onItemLookup={handleItemLookup}
                onReprint={handleReprint}
                onDiscount={handleDiscount}
                onMultiplePayment={handleMultiplePayment}
                onCompleteTransaction={handleCompleteTransaction}
                hasActiveOrder={!!serviceOrders.activeServiceOrder}
            />

            {/* Modals */}
            <ParkSaleModal
                isOpen={modals.parkSale.isOpen}
                onClose={modals.parkSale.close}
                onSuccess={modals.parkSale.close}
            />

            <ParkedSalesModal
                isOpen={modals.parkedSales.isOpen}
                onClose={modals.parkedSales.close}
                onResumeSuccess={modals.parkedSales.close}
            />

            <ItemLookupModal
                isOpen={modals.lookup.isOpen}
                onClose={modals.lookup.close}
                inventory={inventory}
                onAddToCart={handleAddToCartFromLookup}
                barcodeScannerInputRef={barcodeScannerInputRef}
            />

            <CheckoutModal
                focusManager={focusManager}
                paymentMethodId={paymentMethodId}
                isOpen={modals.checkout.isOpen}
                onClose={modals.checkout.close}
                serviceOrderId={serviceOrders.activeServiceOrder?.id}
                onServiceOrderSaleComplete={serviceOrders.clearActiveOrder}
            />

            <MultiplePaymentModal
                isOpen={modals.multiplePayment.isOpen}
                onClose={modals.multiplePayment.close}
                serviceOrderId={serviceOrders.activeServiceOrder?.id}
                onServiceOrderSaleComplete={serviceOrders.clearActiveOrder}
            />

            <DiscountModal
                isOpen={modals.discount.isOpen}
                onClose={modals.discount.close}
            />

            <ReprintModal
                isOpen={modals.reprint.isOpen}
                onClose={modals.reprint.close}
            />

            {isServiceLayout && (
                <>
                    <CreateServiceOrderModal
                        isOpen={serviceOrders.isCreateOrderOpen}
                        onClose={serviceOrders.closeCreateOrder}
                        staffAssignments={serviceOrders.staffAssignments}
                        onSuccess={() => serviceOrders.setStaffAssignments({})}
                    />

                    <ServiceOrdersListModal
                        isOpen={serviceOrders.isServiceOrdersOpen}
                        onClose={serviceOrders.closeServiceOrders}
                        onSelectOrder={serviceOrders.handleCheckoutOrder}
                    />
                </>
            )}
        </div>
    );
};

export default DesktopPOS;
