import React, { FunctionComponent, useRef, useState, useEffect } from 'react';
import { ActiveInputType } from './CheckoutModal';
import VirtualKeyboard from '../../../components/VirtualKeyboard';
import { Phone } from 'lucide-react';
import { FormikErrors } from 'formik';
import FormInput from '../../../components/FormInput';

interface EPaymentProps {
    total: number;
    values: TransactionValues;
    activeInput: ActiveInputType;
    onValueChange: (field: keyof TransactionValues, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<TransactionValues>>
    onActiveInputChange: (input: ActiveInputType) => void;
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
}) => {
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const referenceNumberInputRef = useRef<HTMLInputElement>(null);
    const [selectedSubMethod, setSelectedSubMethod] = useState('airtel-money');
    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isVirtualKeyboardActive = useRef(false);

    useEffect(() => {
        if (selectedSubMethod) onValueChange('paymentServiceProviderUuid', selectedSubMethod)
    }, [])

    useEffect(() => {
        if (phoneInputRef.current) {
            phoneInputRef.current.focus();
        }
    }, []);

    const handleOnMethodSelect = (methodId: string) => {
        setSelectedSubMethod(methodId);
        onValueChange('paymentServiceProviderUuid', methodId);

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
        } else if (activeInput === 'referenceNo' && values.transactionId.length >= 5) {
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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <div>
                    <div className="mb-6">
                        <div className="grid grid-cols-2 gap-4">
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
                                        className={`p-6 rounded-none flex flex-col items-center gap-3 transition-colors ${selectedSubMethod === method.id
                                            ? method.color + ' text-white'
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                            }`}
                                    >
                                        <IconComponent size={32} />
                                        <span className="text-sm font-bold text-center">{method.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {(selectedSubMethod === 'airtel-money' || selectedSubMethod === 'tnm-mpamba') && (
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-black dark:text-gray-400 mb-3">PHONE NUMBER</h3>
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
                                className={`w-full p-4 border border-gray-300 rounded-none text-black text-xl font-mono ${activeInput === 'phoneNumber' ? 'border-blue-500 bg-blue-50' : ''
                                    }`}
                            />
                            {activeInput === 'phoneNumber' && (
                                <div className="text-sm text-blue-600 mt-1">
                                    Use virtual keyboard to enter phone number (numbers only)
                                </div>
                            )}
                        </div>
                    )}

                    <div className="">
                        <h3 className="text-2xl font-bold text-black dark:text-gray-400 mb-3">
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
                            className={`w-full p-4 border border-gray-300 rounded-none text-black text-xl font-mono ${activeInput === 'referenceNo' ? 'border-blue-500 bg-blue-50' : ''
                                }`}
                        />
                        {activeInput === 'referenceNo' && (
                            <div className="text-sm text-blue-600 mt-1">
                                Use virtual keyboard to enter reference number (letters and numbers)
                            </div>
                        )}
                    </div>
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
                </div>
            </div>

            <div
                onMouseDown={handleVirtualKeyboardMouseDown}
                onMouseUp={handleVirtualKeyboardMouseUp}
            >
                <VirtualKeyboard
                    onKeyPress={handleVirtualKeyPress}
                    onBackspace={handleVirtualBackspace}
                    onEnter={handleVirtualEnter}
                    onSpace={handleVirtualSpace}
                    className="virtual-keyboard w-full mt-4"
                />
            </div>
        </div>
    );
};

export default EPayment;