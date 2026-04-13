import { FunctionComponent } from 'react';
import Panel from '../../../components/Panel';
import CartTable from '../partials/CartTable';
import ServiceCartTable from '../partials/ServiceCartTable';
import InputKeyboard from '../../../components/InputKeyboard';
import classNames from 'classnames';
import type { POSLayoutConfig } from '../hooks/usePOSLayout';
import type { useFocusManager } from '../../../hooks/useFocusManager';
import type { useKeyboardSettings } from '../../../hooks/useKeyboardSettings';

interface CartSectionProps {
    layout: POSLayoutConfig;
    focusManager: ReturnType<typeof useFocusManager>;
    keyboardSettings: ReturnType<typeof useKeyboardSettings>;
    customPriceInputs: Record<string, string>;
    onPriceChange: (itemId: string, value: string) => void;
    onNumpadClick: (value: string) => void;
    onStaffAssignmentsChange?: (assignments: Record<string, string>) => void;
}

const CartSection: FunctionComponent<CartSectionProps> = ({
    layout,
    focusManager,
    keyboardSettings,
    customPriceInputs,
    onPriceChange,
    onNumpadClick,
    onStaffAssignmentsChange,
}) => {
    const { compact, showNumpad, showCatalog } = layout;

    return (
        <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full flex gap-x-2 lg:gap-x-4">
                <Panel size={layout.main.cart} className="w-full h-full">
                    <div className={classNames(
                        "h-full overflow-auto",
                        showCatalog
                            ? "pb-0"
                            : compact ? "pb-28" : "pb-48"
                    )}>
                        {showCatalog ? (
                            <ServiceCartTable
                                focusManager={focusManager}
                                customPriceInputs={customPriceInputs}
                                onPriceChange={onPriceChange}
                                onStaffAssignmentsChange={onStaffAssignmentsChange}
                                compact={compact}
                            />
                        ) : (
                            <CartTable
                                focusManager={focusManager}
                                customPriceInputs={customPriceInputs}
                                onPriceChange={onPriceChange}
                                compact={compact}
                            />
                        )}
                    </div>
                </Panel>

                {showNumpad ? (
                    <Panel size={layout.main.numpad} className="flex flex-shrink-0">
                        <InputKeyboard
                            variant="numpad"
                            onButtonClick={onNumpadClick}
                            focusManager={focusManager}
                            settings={{
                                theme: keyboardSettings.theme,
                                enableSound: keyboardSettings.enableSound,
                                enableHaptic: keyboardSettings.enableHaptic,
                            }}
                            compact={compact}
                        />
                    </Panel>
                ) : null}
            </div>
        </div>
    );
};

export default CartSection;
