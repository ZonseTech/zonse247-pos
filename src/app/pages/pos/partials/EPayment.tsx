import React, { FunctionComponent, useRef, useState, useEffect } from 'react';
import { ActiveInputType } from './CheckoutModal';
import VirtualKeyboard from '../../../components/VirtualKeyboard';
import { Phone } from 'lucide-react';

interface EPaymentProps {
    total: number;
    phoneNumber: string;
    activeInput: ActiveInputType;
    processing: boolean;
    onPhoneChange: (phone: string) => void;
    onActiveInputChange: (input: ActiveInputType) => void;
}

export const E_PAYMENT_METHODS = [
    { id: 'airtel-money', name: 'Airtel Money', icon: Phone, color: 'bg-red-500' },
    { id: 'tnm-mpamba', name: 'TNM Mpamba', icon: Phone, color: 'bg-yellow-500' },
];

const EPayment: FunctionComponent<EPaymentProps> = ({
    total,
    phoneNumber,
    activeInput,
    processing,
    onPhoneChange,
    onActiveInputChange,
}) => {
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const [selectedSubMethod, setSelectedSubMethod] = useState('airtel-money');

    useEffect(() => {
        if (phoneInputRef.current) {
            phoneInputRef.current.focus();
        }
    }, []);

    const handleOnMethodSelect = (methodId: string) => {
        setSelectedSubMethod(methodId);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            onPhoneChange(value);
        }
    };

    const handleInputFocus = () => {
        onActiveInputChange('phone');
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            onActiveInputChange(null);
        }, 100);
    };

    const handleVirtualKeyPress = (key: string) => {
        if (activeInput === 'phone' && /^\d$/.test(key) && phoneNumber.length < 10) {
            onPhoneChange(phoneNumber + key);
        }
    };

    const handleVirtualBackspace = () => {
        if (activeInput === 'phone') {
            onPhoneChange(phoneNumber.slice(0, -1));
        }
    };

    const handleVirtualEnter = () => {
        if (activeInput === 'phone' && phoneNumber.length >= 9) {
            phoneInputRef.current?.blur();
        }
    };

    const handleVirtualSpace = () => {
        // 
    };

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
                                        onClick={() => handleOnMethodSelect(method.id)}
                                        disabled={processing}
                                        className={`p-6 rounded-none flex flex-col items-center gap-3 transition-colors ${selectedSubMethod === method.id
                                            ? method.color + ' text-white'
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                            <input
                                ref={phoneInputRef}
                                type="tel"
                                value={phoneNumber}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                placeholder="e.g., 0881234567"
                                disabled={processing}
                                maxLength={10}
                                className={`w-full p-4 border border-gray-300 rounded-none text-black text-xl font-mono ${activeInput === 'phone' ? 'border-gray-500' : ''
                                    } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    )}
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
                                <span className="font-bold">Processing e-payment...</span>
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
                className="virtual-keyboard w-full mt-4"
            />
        </div>
    );
};

export default EPayment;