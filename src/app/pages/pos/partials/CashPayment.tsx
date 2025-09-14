import { FunctionComponent, useState, useEffect, useRef } from 'react';
import Numpad from '../../../components/Numpad';
import { useFocusManager } from '../../../hooks/useFocusManager';

interface CashPaymentProps {
    total: number;
    onCashTenderedChange: (cashTendered: string) => void;
    focusManager: ReturnType<typeof useFocusManager>;
    processing: boolean;
}

const CashPayment: FunctionComponent<CashPaymentProps> = ({
    total,
    onCashTenderedChange,
    focusManager,
    processing
}) => {
    const [cashTendered, setCashTendered] = useState<string>('');
    const [change, setChange] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef) inputRef.current.focus()
    }, [])

    useEffect(() => {
        const tendered = parseFloat(cashTendered) || 0;
        setChange(Math.max(0, tendered - total));
        onCashTenderedChange(cashTendered);
    }, [cashTendered, total, onCashTenderedChange]);

    const handleNumpadClick = (value: string) => {
        if (value === 'Del') {
            setCashTendered(prev => prev.slice(0, -1));
        } else if (value === 'Clear') {
            setCashTendered('');
        } else if (value === '•') {
            if (!cashTendered.includes('.')) {
                setCashTendered(prev => prev === '' ? '0.' : prev + '.');
            }
        } else if (!isNaN(parseInt(value))) {
            setCashTendered(prev => {
                const newValue = prev === '0' ? value : prev + value;
                const numericValue = parseFloat(newValue);
                return numericValue <= 9999999.99 ? newValue : prev;
            });
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!focusManager.isActive('cash')) return;

        const { key } = event;
        if (key === 'Backspace') {
            setCashTendered(prev => prev.slice(0, -1));
            event.preventDefault();
        } else if (key === 'Enter') {
            event.preventDefault();
        } else if (key === '.') {
            if (!cashTendered.includes('.')) {
                setCashTendered(prev => prev === '' ? '0.' : prev + '.');
            }
            event.preventDefault();
        } else if (/^\d$/.test(key)) {
            setCashTendered(prev => {
                const newValue = prev === '0' ? key : prev + key;
                const numericValue = parseFloat(newValue);
                return numericValue <= 9999999.99 ? newValue : prev;
            });
            event.preventDefault();
        }
    };

    const handleFocus = () => {
        focusManager.setActiveComponent('cash');
    };

    const handleBlur = () => {
        focusManager.clearFocus();
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <div>
                <h3 className="text-3xl font-bold text-black dark:text-gray-400 mb-4">ENTER CASH AMOUNT</h3>
                <Numpad
                    onButtonClick={handleNumpadClick}
                    focusManager={focusManager}
                    className='h-fit'
                    type='basic'
                />
            </div>
            <div className='space-y-8'>
                <div>
                    <h3 className="text-5xl font-bold text-black dark:text-gray-400 mb-2">BALANCE DUE</h3>
                    <input
                        type="text"
                        value={`MK ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        readOnly
                        className="bg-gray-800 text-green-400 text-center p-6 text-5xl font-bold rounded-none w-full"
                    />
                </div>
                <div>
                    <h3 className="text-5xl font-bold text-black dark:text-gray-400 mb-2">CASH TENDERED</h3>
                    <input
                        type="text"
                        value={`MK ${(parseFloat(cashTendered) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        onChange={(e) => {
                            const value = e.target.value.replace('MK ', '').replace(/,/g, '');
                            setCashTendered(value);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        ref={inputRef}
                        className="bg-gray-800 text-white text-center p-6 text-5xl font-bold rounded-none w-full"
                    />
                </div>
                <div>
                    <h3 className="text-5xl font-bold text-black dark:text-gray-400 mb-2">CHANGE</h3>
                    <input
                        type="text"
                        value={`MK ${change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        readOnly
                        className="bg-gray-800 text-yellow-400 text-center p-6 text-5xl font-bold rounded-none w-full"
                    />
                </div>
                {processing && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                            <span className="font-bold">Processing cash payment...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashPayment;