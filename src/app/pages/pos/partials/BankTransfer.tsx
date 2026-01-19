import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { ActiveInputType } from './CheckoutModal';
import InputKeyboard from '../../../components/InputKeyboard';
import { useKeyboardSettings } from '../../../hooks/useKeyboardSettings';
import { FormikErrors } from 'formik';
import FormInput from '../../../components/FormInput';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { Smartphone, CreditCard } from 'lucide-react';
import classNames from 'classnames';

interface BankTransferProps {
    total: number;
    values: TransactionValues;
    activeInput: ActiveInputType;
    onValueChange: (field: keyof TransactionValues, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<TransactionValues>>
    onActiveInputChange: (input: ActiveInputType) => void;
    compact?: boolean;
}

export const TRANSFER_TYPES = [
    { id: 'mobile-banking', name: 'Mobile Banking', icon: Smartphone, color: 'bg-blue-500' },
    { id: 'pos-machine', name: 'POS Machine', icon: CreditCard, color: 'bg-purple-500' },
];

const BankTransfer: FunctionComponent<BankTransferProps> = ({
    total,
    values,
    activeInput,
    onValueChange,
    onActiveInputChange,
    compact = false,
}) => {
    const isMobile = useIsMobile();
    const keyboardSettings = useKeyboardSettings();
    const accountInputRef = useRef<HTMLInputElement>(null);
    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isVirtualKeyboardActive = useRef(false);
    const [selectedTransferType, setSelectedTransferType] = useState('mobile-banking');

    useEffect(() => {
        onValueChange('paymentServiceProviderId', 'nb-bank');
        onValueChange('transferType', 'mobile-banking');
    }, [])

    useEffect(() => {
        if (accountInputRef.current) {
            accountInputRef.current.focus();
        }
    }, []);

    const handleTransferTypeSelect = (typeId: string) => {
        setSelectedTransferType(typeId);
        onValueChange('transferType', typeId);
    };

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
            <div className={classNames(
                "grid grid-cols-1 xl:grid-cols-2",
                compact ? "gap-2" : "gap-4 md:gap-6"
            )}>
                <div>
                    <div className={compact ? "mb-2" : "mb-4 md:mb-6"}>
                        <h3 className={classNames(
                            "font-bold text-black dark:text-gray-400",
                            compact ? "text-sm mb-1" : "text-lg md:text-2xl mb-2 md:mb-3"
                        )}>TRANSFER TYPE</h3>
                        <div className={classNames(
                            "grid grid-cols-2",
                            compact ? "gap-1" : "gap-2 md:gap-4"
                        )}>
                            {TRANSFER_TYPES.map((type) => {
                                const IconComponent = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleTransferTypeSelect(type.id);
                                        }}
                                        className={classNames(
                                            "rounded-none flex flex-col items-center transition-colors",
                                            compact ? "p-2 gap-1" : "p-3 md:p-6 gap-2 md:gap-3",
                                            selectedTransferType === type.id
                                                ? type.color + ' text-white'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        )}
                                    >
                                        <IconComponent className={compact ? "w-4 h-4" : "w-6 h-6 md:w-8 md:h-8"} />
                                        <span className={classNames(
                                            "font-bold text-center",
                                            compact ? "text-[10px]" : "text-xs md:text-sm"
                                        )}>{type.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <h3 className={classNames(
                        "font-bold text-black dark:text-gray-400",
                        compact ? "text-sm mb-1" : "text-lg md:text-3xl mb-3 md:mb-4"
                    )}>ACCOUNT DETAILS</h3>
                    <div className={compact ? "mb-2" : "mb-4 md:mb-6"}>
                        <label className={classNames(
                            "block font-semibold text-black dark:text-gray-400",
                            compact ? "text-xs mb-1" : "text-sm md:text-lg mb-2"
                        )}>
                            BANK
                        </label>
                        <select
                            className={classNames(
                                "w-full border border-gray-300 rounded-none text-black",
                                compact ? "p-2 text-sm" : "p-3 md:p-4 text-base md:text-xl"
                            )}
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

                    <div className={compact ? "mb-2" : "mb-4 md:mb-6"}>
                        <label className={classNames(
                            "block font-semibold text-black dark:text-gray-400",
                            compact ? "text-xs mb-1" : "text-sm md:text-lg mb-2"
                        )}>
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
                            className={classNames(
                                "w-full border rounded-none text-black font-mono",
                                compact ? "p-2 text-sm" : "p-3 md:p-4 text-base md:text-xl",
                                activeInput === 'referenceNo' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            )}
                        />
                    </div>
                </div>

                <div className={compact ? "space-y-2" : "space-y-4 md:space-y-8"}>
                    <div>
                        <h3 className={classNames(
                            "font-bold text-black dark:text-gray-400",
                            compact ? "text-sm mb-1" : "text-xl md:text-5xl mb-2"
                        )}>BALANCE DUE</h3>
                        <div className={classNames(
                            "bg-gray-800 text-green-400 text-center font-bold rounded-none",
                            compact ? "p-2 text-lg" : "p-4 md:p-6 text-2xl md:text-5xl"
                        )}>
                            MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div>
                        <h3 className={classNames(
                            "font-bold text-black dark:text-gray-400",
                            compact ? "text-sm mb-1" : "text-xl md:text-5xl mb-2"
                        )}>PAYMENT AMOUNT</h3>
                        <div className={classNames(
                            "bg-gray-800 text-white text-center font-bold rounded-none",
                            compact ? "p-2 text-lg" : "p-4 md:p-6 text-2xl md:text-5xl"
                        )}>
                            MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>

            {!isMobile && keyboardSettings.enabled && <div
                onMouseDown={handleVirtualKeyboardMouseDown}
                onMouseUp={handleVirtualKeyboardMouseUp}
            >
                <InputKeyboard
                    variant="full"
                    onKeyPress={handleVirtualKeyPress}
                    onBackspace={handleVirtualBackspace}
                    onEnter={handleVirtualEnter}
                    onSpace={handleVirtualSpace}
                    className={classNames("w-full", compact ? "mt-2" : "mt-4")}
                    settings={{
                        theme: keyboardSettings.theme,
                        enableSound: keyboardSettings.enableSound,
                        enableHaptic: keyboardSettings.enableHaptic,
                    }}
                    compact={compact}
                />
            </div>}
        </div>
    );
};

export default BankTransfer;