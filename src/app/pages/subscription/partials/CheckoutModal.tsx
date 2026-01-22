import { useState } from 'react';
import type { FunctionComponent } from 'react';
import { Button, Input } from '../../../components';
import { CopyButton } from '../../../components/buttons/CopyButton';
import { X, CreditCard, AlertCircle, Banknote, Check, ChevronRight, ChevronLeft } from 'lucide-react';

interface CheckoutModalProps {
    selectedPlan: SubscriptionPlan;
    billingCycle: 'monthly' | 'yearly';
    tenantInfo: TenantInfo;
    paymentInfo: PaymentInfo;
    onClose: () => void;
    onPaymentInfoChange: (info: PaymentInfo) => void;
    onSubmit: (e: React.FormEvent) => void;
    getPrice: (plan: SubscriptionPlan) => string;
}

const CheckoutModal: FunctionComponent<CheckoutModalProps> = ({
    selectedPlan,
    billingCycle,
    tenantInfo,
    paymentInfo,
    onClose,
    onPaymentInfoChange,
    onSubmit,
    getPrice,
}) => {
    const isFreePlan = selectedPlan.name === 'BASIC';
    const [currentStep, setCurrentStep] = useState(1);

    const steps = isFreePlan
        ? [{ number: 2, title: 'Review', icon: Check }]
        : [
            { number: 1, title: 'Payment', icon: Banknote },
            { number: 2, title: 'Review', icon: Check }
        ];

    const paymentMethods = [
        { name: 'Airtel Money', number: '265999883377' },
        { name: 'MPamba (TNM)', number: '265882299339' },
        { name: 'Bank Transfer', number: '1003356481' }
    ];

    const canProceed = () => {
        if (currentStep === 1 && !isFreePlan) {
            return paymentInfo.referenceNumber;
        }
        return true;
    };

    const handleNext = () => {
        if (canProceed()) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        currentStep === steps.length ? onSubmit(e) : handleNext();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl my-8">
                <div className="relative rounded-t-2xl bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-700 text-white px-8 pt-6 pb-0.5">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                        type="button"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">
                            {isFreePlan ? 'Get Started Free' : `Subscribe to ${selectedPlan.name} Plan`}
                        </h2>
                        <p className="text-sky-100 text-lg">
                            {isFreePlan ? 'No credit card required' : `${getPrice(selectedPlan)}/${billingCycle === 'monthly' ? 'mo' : 'yr'}`}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="p-8">
                    {currentStep === 2 && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Review & Confirm</h3>
                            <p className="text-sm text-gray-500">Please review your information before submitting</p>
                        </div>
                    )}

                    {currentStep === 1 && !isFreePlan && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-900">
                                        <p className="font-semibold mb-2">Payment Instructions:</p>
                                        <ol className="list-decimal ml-4 space-y-2">
                                            <li>
                                                <span className="font-medium">Choose your preferred payment method:</span>
                                                <ul className="list-disc ml-5 mt-1.5 space-y-1">
                                                    {paymentMethods.map((method) => (
                                                        <li key={method.name} className="flex items-center justify-between gap-2">
                                                            <span>{method.name}: <strong className="font-mono">{method.number}</strong></span>
                                                            <CopyButton text={method.number} />
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                            <li>Send payment of <strong>{getPrice(selectedPlan)}</strong> to the provided account</li>
                                            <li>Keep your transaction reference number</li>
                                            <li>Enter the reference number below</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Reference Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    required
                                    value={paymentInfo.referenceNumber || ''}
                                    onChange={(e) => onPaymentInfoChange({ ...paymentInfo, referenceNumber: e.target.value })}
                                    placeholder="Enter transaction ID / reference number"
                                />
                                <p className="text-sm text-gray-500 mt-2 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    This is the transaction ID/reference number you received after completing the payment
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStep === steps.length && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl p-6 border border-sky-200">
                                <h4 className="font-semibold text-gray-900 mb-4">Subscription Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Plan:</span>
                                        <span className="font-semibold text-gray-900">{selectedPlan.name}</span>
                                    </div>
                                    {!isFreePlan && (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Billing Cycle:</span>
                                                <span className="font-semibold text-gray-900 capitalize">{billingCycle}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-sky-200">
                                                <span className="text-gray-600">Amount:</span>
                                                <span className="text-2xl font-bold text-sky-600">
                                                    {getPrice(selectedPlan)}
                                                    <span className="text-sm text-gray-600">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-4">Business Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-600">Business Name:</span>
                                        <span className="font-medium text-gray-900 text-right">{tenantInfo.businessName}</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium text-gray-900 text-right">{tenantInfo.email}</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium text-gray-900 text-right">{tenantInfo.phoneNumber}</span>
                                    </div>
                                    {tenantInfo.address && (
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600">Address:</span>
                                            <span className="font-medium text-gray-900 text-right max-w-xs">{tenantInfo.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isFreePlan && (
                                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                    <h4 className="font-semibold text-gray-900 mb-4">Payment Information</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Reference Number:</span>
                                        <span className="font-mono font-semibold text-gray-900">{paymentInfo.referenceNumber}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${currentStep === 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back
                        </button>

                        <Button
                            type="submit"
                            disabled={!canProceed()}
                            className={`flex items-center gap-2 px-8 py-3 font-semibold transition-all ${canProceed()
                                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-none'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {currentStep === steps.length ? (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    {isFreePlan ? 'Get Started Now' : 'Confirm Subscription'}
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;