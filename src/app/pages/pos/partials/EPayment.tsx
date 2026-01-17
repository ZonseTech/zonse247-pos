import React, { FunctionComponent, useRef, useState, useEffect } from 'react';
import { ActiveInputType } from './CheckoutModal';
import InputKeyboard from '../../../components/InputKeyboard';
import { useKeyboardSettings } from '../../../hooks/useKeyboardSettings';
import { Phone } from 'lucide-react';
import { FormikErrors } from 'formik';
import FormInput from '../../../components/FormInput';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import classNames from 'classnames';

interface EPaymentProps {
    total: number;
    values: TransactionValues;
    activeInput: ActiveInputType;
    onValueChange: (field: keyof TransactionValues, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<TransactionValues>>
    onActiveInputChange: (input: ActiveInputType) => void;
    compact?: boolean;
}

export const E_PAYMENT_METHODS = [
    { id: 'airtel-money', name: 'Airtel Money', icon: Phone, color: 'bg-red-500' },
    { id: 'tnm-mpamba', name: 'TNM Mpamba', icon: Phone, color: 'bg-yellow-500' },
];

const EPayment: FunctionComponent<EPaymentProps> = ({
    total,
    values,
    activeInput,
    onValueChange,
    onActiveInputChange,
    compact = false,
}) => {
    const isMobile = useIsMobile();
    const keyboardSettings = useKeyboardSettings();
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const referenceNumberInputRef = useRef<HTMLInputElement>(null);
    const [selectedSubMethod, setSelectedSubMethod] = useState('airtel-money');
    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isVirtualKeyboardActive = useRef(false);

    useEffect(() => {
        if (selectedSubMethod) onValueChange('paymentServiceProviderId', selectedSubMethod)
    }, [])

    useEffect(() => {
        if (phoneInputRef.current) {
            phoneInputRef.current.focus();
        }
    }, []);

    const handleOnMethodSelect = (methodId: string) => {
        setSelectedSubMethod(methodId);
        onValueChange('paymentServiceProviderId', methodId);

        setTimeout(() => {
            phoneInputRef.current?.focus();
        }, 100);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phoneNumber') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length <= 10) {
                onValueChange('phoneNumber', numericValue);
            }
        } else if (name === 'transactionId') {
            onValueChange('transactionId', value);
        }
    };

    const handleInputFocus = (elementName: ActiveInputType) => {
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
        }
        onActiveInputChange(elementName);
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

        if (activeInput === 'phoneNumber' && /^\d$/.test(key) && values.phoneNumber.length < 10) {
            onValueChange('phoneNumber', values.phoneNumber + key);
        } else if (activeInput === 'referenceNo') {
            if (/^[a-zA-Z0-9]$/.test(key)) {
                onValueChange('transactionId', values.transactionId + key);
            }
        }

        setTimeout(() => {
            isVirtualKeyboardActive.current = false;
        }, 50);
    };

    const handleVirtualBackspace = () => {
        isVirtualKeyboardActive.current = true;

        if (activeInput === 'phoneNumber') {
            onValueChange('phoneNumber', values.phoneNumber.slice(0, -1));
        } else if (activeInput === 'referenceNo') {
            onValueChange('transactionId', values.transactionId.slice(0, -1));
        }

        setTimeout(() => {
            isVirtualKeyboardActive.current = false;
        }, 50);
    };

    const handleVirtualEnter = () => {
        isVirtualKeyboardActive.current = true;

        if (activeInput === 'phoneNumber' && values.phoneNumber.length >= 9) {
            setTimeout(() => {
                referenceNumberInputRef.current?.focus();
                isVirtualKeyboardActive.current = false;
            }, 50);
        } else if (activeInput === 'referenceNo') {
            setTimeout(() => {
                referenceNumberInputRef.current?.blur();
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

        if (activeInput === 'referenceNo') {
            onValueChange('transactionId', values.transactionId + ' ');
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

    useEffect(() => {
        return () => {
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-col">
            <div className={classNames(
                "grid grid-cols-1 xl:grid-cols-2",
                compact ? "gap-2" : "gap-4 md:gap-6"
            )}>
                <div>
                    <div className={compact ? "mb-2" : "mb-3 md:mb-4"}>
                        <div className={classNames(
                            "grid grid-cols-2",
                            compact ? "gap-1" : "gap-2 md:gap-4"
                        )}>
                            {E_PAYMENT_METHODS.map((method) => {
                                const IconComponent = method.icon;
                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleOnMethodSelect(method.id)
                                        }}
                                        className={classNames(
                                            "rounded-none flex flex-col items-center transition-colors",
                                            compact ? "p-2 gap-1" : "p-3 md:p-6 gap-2 md:gap-3",
                                            selectedSubMethod === method.id
                                                ? method.color + ' text-white'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        )}
                                    >
                                        <IconComponent className={compact ? "w-4 h-4" : "w-6 h-6 md:w-8 md:h-8"} />
                                        <span className={classNames(
                                            "font-bold text-center",
                                            compact ? "text-[10px]" : "text-xs md:text-sm"
                                        )}>{method.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {(selectedSubMethod === 'airtel-money' || selectedSubMethod === 'tnm-mpamba') && (
                        <div className={compact ? "mb-2" : "mb-4 md:mb-6"}>
                            <h3 className={classNames(
                                "font-bold text-black dark:text-gray-400",
                                compact ? "text-xs mb-1" : "text-sm md:text-xl mb-2 md:mb-3"
                            )}>PHONE NUMBER</h3>
                            <FormInput
                                ref={phoneInputRef}
                                type="tel"
                                value={values.phoneNumber}
                                onChange={handleInputChange}
                                onFocus={() => handleInputFocus('phoneNumber')}
                                onBlur={handleInputBlur}
                                placeholder="e.g., 0881234567"
                                name='phoneNumber'
                                maxLength={10}
                                className={classNames(
                                    "w-full border border-gray-300 rounded-none text-black font-mono",
                                    compact ? "p-2 text-sm" : "p-3 md:p-4 text-base md:text-xl",
                                    activeInput === 'phoneNumber' && 'border-blue-500 bg-blue-50'
                                )}
                            />
                        </div>
                    )}

                    <div className={compact ? "mb-2" : "mb-4 md:mb-0"}>
                        <h3 className={classNames(
                            "font-bold text-black dark:text-gray-400",
                            compact ? "text-xs mb-1" : "text-sm md:text-xl mb-2 md:mb-3"
                        )}>
                            REFERENCE NUMBER
                        </h3>
                        <FormInput
                            ref={referenceNumberInputRef}
                            type="text"
                            value={values.transactionId}
                            onChange={handleInputChange}
                            onFocus={() => handleInputFocus('referenceNo')}
                            onBlur={handleInputBlur}
                            placeholder="REF.GGJH878.292..."
                            name='transactionId'
                            maxLength={50}
                            className={classNames(
                                "w-full border border-gray-300 rounded-none text-black font-mono",
                                compact ? "p-2 text-sm" : "p-3 md:p-4 text-base md:text-xl",
                                activeInput === 'referenceNo' && 'border-blue-500 bg-blue-50'
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
                    className={classNames("virtual-keyboard w-full", compact ? "mt-2" : "mt-4")}
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

export default EPayment;