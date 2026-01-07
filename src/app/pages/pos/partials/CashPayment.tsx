import { FunctionComponent, useState, useEffect, useRef } from 'react';
import InputKeyboard from '../../../components/InputKeyboard';
import { useFocusManager } from '../../../hooks/useFocusManager';
import { useKeyboardSettings } from '../../../hooks/useKeyboardSettings';
import { FormikErrors } from 'formik';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface CashPaymentProps {
    total: number;
    values: TransactionValues;
    onValueChange: (field: keyof TransactionValues, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<TransactionValues>>
    focusManager: ReturnType<typeof useFocusManager>;
}

const CashPayment: FunctionComponent<CashPaymentProps> = ({
    total,
    values,
    onValueChange,
    focusManager,
}) => {
    const isMobile = useIsMobile();
    const keyboardSettings = useKeyboardSettings();
    const [change, setChange] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const tendered = parseFloat(values.cashTendered) || 0;
        setChange(Math.max(0, tendered - total));
    }, [values.cashTendered, total]);

    const handleNumpadClick = (value: string) => {
        const currentCash = values.cashTendered || '';

        if (value === 'Del') {
            onValueChange('cashTendered', currentCash.slice(0, -1));
        } else if (value === 'Clear') {
            onValueChange('cashTendered', '');
        } else if (value === '•') {
            if (!currentCash.includes('.')) {
                const newValue = currentCash === '' ? '0.' : currentCash + '.';
                onValueChange('cashTendered', newValue);
            }
        } else if (!isNaN(parseInt(value))) {
            const newValue = currentCash === '0' ? value : currentCash + value;
            const numericValue = parseFloat(newValue);
            if (numericValue <= 9999999.99) {
                onValueChange('cashTendered', newValue);
            }
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!focusManager.isActive('cash')) return;

        const { key } = event;
        const currentCash = values.cashTendered || '';

        if (key === 'Backspace') {
            onValueChange('cashTendered', currentCash.slice(0, -1));
            event.preventDefault();
        } else if (key === 'Enter') {
            event.preventDefault();
        } else if (key === '.') {
            if (!currentCash.includes('.')) {
                const newValue = currentCash === '' ? '0.' : currentCash + '.';
                onValueChange('cashTendered', newValue);
            }
            event.preventDefault();
        } else if (/^\d$/.test(key)) {
            const newValue = currentCash === '0' ? key : currentCash + key;
            const numericValue = parseFloat(newValue);
            if (numericValue <= 9999999.99) {
                onValueChange('cashTendered', newValue);
            }
            event.preventDefault();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace('MK ', '').replace(/,/g, '');
        const numericValue = parseFloat(value);

        if (!isNaN(numericValue) && numericValue <= 9999999.99) {
            onValueChange('cashTendered', value);
        } else if (value === '') {
            onValueChange('cashTendered', '');
        }
    };

    const handleFocus = () => {
        focusManager.setActiveComponent('cash');
    };

    const handleBlur = () => {
        focusManager.clearFocus();
    };

    const formatDisplayValue = (value: string) => {
        const numericValue = parseFloat(value) || 0;
        return `MK ${numericValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const showKeyboard = !isMobile && keyboardSettings.enabled;

    return (
        <div className={`grid grid-cols-1 ${showKeyboard ? 'xl:grid-cols-2' : ''} gap-4 md:gap-6 mb-6 md:mb-8`}>
            {showKeyboard && <div>
                <InputKeyboard
                    variant="numpad"
                    onButtonClick={handleNumpadClick}
                    focusManager={focusManager}
                    className='h-fit'
                    numpadType='basic'
                    title="Enter Cash Amount"
                    settings={{
                        theme: keyboardSettings.theme,
                        enableSound: keyboardSettings.enableSound,
                        enableHaptic: keyboardSettings.enableHaptic,
                    }}
                />
            </div>}
            <div className={`space-y-4 md:space-y-8 ${!showKeyboard ? 'max-w-2xl mx-auto w-full' : ''}`}>
                <div>
                    <h3 className="text-xl md:text-5xl font-bold text-black dark:text-gray-400 mb-2">BALANCE DUE</h3>
                    <input
                        type="text"
                        value={`MK ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        readOnly
                        className="bg-gray-800 text-green-400 text-center p-4 md:p-6 text-2xl md:text-5xl font-bold rounded-none w-full"
                    />
                </div>
                <div>
                    <h3 className="text-xl md:text-5xl font-bold text-black dark:text-gray-400 mb-2">CASH TENDERED</h3>
                    <input
                        type="text"
                        value={formatDisplayValue(values.cashTendered || '')}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        ref={inputRef}
                        className={`bg-gray-800 text-white text-center p-4 md:p-6 text-2xl md:text-5xl font-bold rounded-none w-full`}
                    />
                </div>
                <div>
                    <h3 className="text-xl md:text-5xl font-bold text-black dark:text-gray-400 mb-2">CHANGE</h3>
                    <input
                        type="text"
                        value={`MK ${change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        readOnly
                        className="bg-gray-800 text-yellow-400 text-center p-4 md:p-6 text-2xl md:text-5xl font-bold rounded-none w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default CashPayment;