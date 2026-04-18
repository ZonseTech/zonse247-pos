import { FunctionComponent, RefObject } from 'react';
import BarcodeScanner from '../partials/BarcodeScanner';
import CustomerSelector from '../../customers/partials/CustomerSelector';
import classNames from 'classnames';
import type { POSLayoutConfig } from '../hooks/usePOSLayout';
import type { useFocusManager } from '../../../hooks/useFocusManager';

interface ScannerBarProps {
    layout: POSLayoutConfig;
    focusManager: ReturnType<typeof useFocusManager>;
    barcodeScannerInputRef: RefObject<HTMLInputElement | null>;
    numpadInput: string;
    cartItemCount: number;
    onNumpadInputProcessed: () => void;
}

const ScannerBar: FunctionComponent<ScannerBarProps> = ({
    layout,
    focusManager,
    barcodeScannerInputRef,
    numpadInput,
    cartItemCount,
    onNumpadInputProcessed,
}) => {
    const { compact } = layout;

    return (
        <div className={classNames(
            "flex-shrink-0",
            compact ? "px-2 py-1" : "px-2 lg:px-4 py-3"
        )}>
            <div className="flex gap-x-2 lg:gap-x-4">
                <div className="flex-1 min-w-0">
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
                </div>

                <div className="w-1/4 flex-shrink-0">
                    <label className={classNames(
                        "block font-bold text-black dark:text-gray-400",
                        compact ? "text-xs mb-0.5" : "text-base lg:text-lg mb-0.5 lg:mb-1"
                    )}>
                        TOTAL ITEMS
                    </label>
                    <div className={classNames(
                        "bg-gray-800 text-white font-bold text-center",
                        compact ? "text-sm py-2" : "text-lg lg:text-xl py-2 lg:py-2.5"
                    )}>
                        {cartItemCount}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScannerBar;
