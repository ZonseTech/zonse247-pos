import { FunctionComponent, useEffect, useRef } from 'react';
import { ActiveInputType } from './CheckoutModal';
import InputKeyboard from '../../../components/InputKeyboard';
import { FormikErrors } from 'formik';
import FormInput from '../../../components/FormInput';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface BankTransferProps {
    total: number;
    values: TransactionValues;
    activeInput: ActiveInputType;
    onValueChange: (field: keyof TransactionValues, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<TransactionValues>>
    onActiveInputChange: (input: ActiveInputType) => void;
}

const BankTransfer: FunctionComponent<BankTransferProps> = ({
    total,
    values,
    activeInput,
    onValueChange,
    onActiveInputChange,
}) => {
    const isMobile = useIsMobile();
    const accountInputRef = useRef<HTMLInputElement>(null);
    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isVirtualKeyboardActive = useRef(false);

    useEffect(() => {
        onValueChange('paymentServiceProviderId', 'nb-bank')
    }, [])

    useEffect(() => {
        if (accountInputRef.current) {
            accountInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        return () => {
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
            }
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'transactionId') {
            if (value.length <= 50 && /^[a-zA-Z0-9\s\-]*$/.test(value)) {
                onValueChange('transactionId', value);
            }
        }
    };

    const handleInputFocus = () => {
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
        }
        onActiveInputChange('referenceNo');
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (isVirtualKeyboardActive.current) {
            e.target.focus();
            return;
        }

        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
        }

        blurTimeoutRef.current = setTimeout(() => {
            if (!isVirtualKeyboardActive.current) {
                onActiveInputChange(null);
            }
            blurTimeoutRef.current = null;
        }, 200);
    };

    const handleVirtualKeyPress = (key: string) => {
        isVirtualKeyboardActive.current = true;
        const currentAccount = values.transactionId || '';

        if (activeInput === 'referenceNo' && /^[a-zA-Z0-9]$/.test(key) && currentAccount.length < 50) {
            onValueChange('transactionId', currentAccount + key);
        }

        setTimeout(() => {
            isVirtualKeyboardActive.current = false;
        }, 50);
    };

    const handleVirtualBackspace = () => {
        isVirtualKeyboardActive.current = true;
        const currentAccount = values.transactionId || '';

        if (activeInput === 'referenceNo') {
            onValueChange('transactionId', currentAccount.slice(0, -1));
        }

        setTimeout(() => {
            isVirtualKeyboardActive.current = false;
        }, 50);
    };

    const handleVirtualEnter = () => {
        isVirtualKeyboardActive.current = true;
        const currentAccount = values.transactionId || '';

        if (activeInput === 'referenceNo' && currentAccount.length > 0) {
            setTimeout(() => {
                accountInputRef.current?.blur();
                onActiveInputChange(null);
                isVirtualKeyboardActive.current = false;
            }, 50);
        } else {
            setTimeout(() => {
                isVirtualKeyboardActive.current = false;
            }, 50);
        }
    };

    const handleVirtualSpace = () => {
        isVirtualKeyboardActive.current = true;
        const currentAccount = values.transactionId || '';

        if (activeInput === 'referenceNo' && currentAccount.length < 50) {
            onValueChange('transactionId', currentAccount + ' ');
        }

        setTimeout(() => {
            isVirtualKeyboardActive.current = false;
        }, 50);
    };

    const handleVirtualKeyboardMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isVirtualKeyboardActive.current = true;
    };

    const handleVirtualKeyboardMouseUp = () => {
        setTimeout(() => {
            isVirtualKeyboardActive.current = false;
        }, 100);
    };

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <h3 className="text-lg md:text-3xl font-bold text-black dark:text-gray-400 mb-3 md:mb-4">ACCOUNT DETAILS</h3>
                    <div className="mb-4 md:mb-6">
                        <label className="block text-sm md:text-lg font-semibold text-black dark:text-gray-400 mb-2">
                            BANK
                        </label>
                        <select
                            className="w-full p-3 md:p-4 border border-gray-300 rounded-none text-black text-base md:text-xl"
                            onChange={(e) => onValueChange('paymentServiceProviderId', e.target.value)}
                            value={values.paymentServiceProviderId}
                            name='paymentServiceProviderId'
                        >
                            <option value="">Select Bank</option>
                            <option value="nb-bank">NB Bank</option>
                            <option value="standard-bank">Standard Bank</option>
                            <option value="fmb">FMB</option>
                            <option value="nedbank">Nedbank</option>
                            <option value="national-bank">National Bank of Malawi</option>
                        </select>
                    </div>

                    <div className="mb-4 md:mb-6">
                        <label className="block text-sm md:text-lg font-semibold text-black dark:text-gray-400 mb-2">
                            REFERENCE NUMBER (Optional)
                        </label>
                        <FormInput
                            ref={accountInputRef}
                            type="text"
                            name="transactionId"
                            value={values.transactionId || ''}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            placeholder="Transfer reference number"
                            maxLength={50}
                            className={`w-full p-3 md:p-4 border border-gray-300 rounded-none text-black text-base md:text-xl font-mono ${activeInput === 'referenceNo' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                }`}
                        />
                    </div>
                </div>

                <div className="space-y-4 md:space-y-8">
                    <div>
                        <h3 className="text-xl md:text-5xl font-bold text-black dark:text-gray-400 mb-2">BALANCE DUE</h3>
                        <div className="bg-gray-800 text-green-400 text-center p-4 md:p-6 text-2xl md:text-5xl font-bold rounded-none">
                            MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl md:text-5xl font-bold text-black dark:text-gray-400 mb-2">PAYMENT AMOUNT</h3>
                        <div className="bg-gray-800 text-white text-center p-4 md:p-6 text-2xl md:text-5xl font-bold rounded-none">
                            MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>

            {!isMobile && <div
                onMouseDown={handleVirtualKeyboardMouseDown}
                onMouseUp={handleVirtualKeyboardMouseUp}
            >
                <InputKeyboard
                    variant="full"
                    onKeyPress={handleVirtualKeyPress}
                    onBackspace={handleVirtualBackspace}
                    onEnter={handleVirtualEnter}
                    onSpace={handleVirtualSpace}
                    className="w-full mt-4"
                />
            </div>}
        </div>
    );
};

export default BankTransfer;