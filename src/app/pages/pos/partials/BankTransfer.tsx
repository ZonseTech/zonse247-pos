import { FunctionComponent, useEffect, useRef } from 'react';
import { ActiveInputType } from './CheckoutModal';
import VirtualKeyboard from '../../../components/VirtualKeyboard';

interface BankTransferProps {
    total: number;
    accountNumber: string;
    activeInput: ActiveInputType;
    processing: boolean;
    onAccountChange: (account: string) => void;
}

const BankTransfer: FunctionComponent<BankTransferProps> = ({
    total,
    accountNumber,
    activeInput,
    processing,
    onAccountChange,
}) => {
    const accountInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (accountInputRef) accountInputRef.current.focus()
    }, [])

    const handleVirtualKeyPress = (key: string) => {
        if (activeInput === 'account' && /^[a-zA-Z0-9]$/.test(key) && accountNumber.length < 20) {
            onAccountChange(accountNumber + key);
        }
    };

    const handleVirtualBackspace = () => {
        if (activeInput === 'account') {
            onAccountChange(accountNumber.slice(0, -1));
        }
    };

    const handleVirtualEnter = () => {
        if (activeInput === 'account' && accountNumber.length > 0) {
            accountInputRef.current?.blur();
        }
    };

    const handleVirtualSpace = () => {
        if (activeInput === 'account' && accountNumber.length < 20) {
            onAccountChange(accountNumber + ' ');
        }
    };

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <div className="mb-6">
                    <h3 className="text-3xl font-bold text-black dark:text-gray-400 mb-4">ACCOUNT DETAILS</h3>
                    <input
                        ref={accountInputRef}
                        type="text"
                        value={accountNumber}
                        onChange={(e) => {
                            if (activeInput !== 'account') {
                                onAccountChange(e.target.value);
                            }
                        }}
                        onFocus={() => { }}
                        onBlur={() => { }}
                        placeholder="Enter account number"
                        disabled={processing}
                        className={`w-full p-4 border border-gray-300 rounded-none text-xl font-mono mb-4 ${activeInput === 'account' ? 'bg-blue-50 border-blue-500' : ''
                            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-5xl font-bold text-black dark:text-gray-400 mb-2">BALANCE DUE</h3>
                        <div className="bg-gray-800 text-green-400 text-center p-6 text-5xl font-bold rounded-none">
                            MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-5xl font-bold text-black dark:text-gray-400 mb-2">PAYMENT AMOUNT</h3>
                        <div className="bg-gray-800 text-white text-center p-6 text-5xl font-bold rounded-none">
                            MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    {processing && (
                        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                                <span className="font-bold">Processing bank transfer...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <VirtualKeyboard
                onKeyPress={handleVirtualKeyPress}
                onBackspace={handleVirtualBackspace}
                onEnter={handleVirtualEnter}
                onSpace={handleVirtualSpace}
                className="w-full mt-4"
            />
        </div>
    );
};

export default BankTransfer;