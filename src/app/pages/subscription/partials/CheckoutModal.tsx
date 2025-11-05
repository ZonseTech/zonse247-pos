import { Button, Input } from '../../../components';
import type { FunctionComponent } from 'react';
import { Fragment, useState } from 'react';
import { X, Building2, CreditCard, AlertCircle, Banknote, Copy, Check, ChevronRight, ChevronLeft } from 'lucide-react';

interface CheckoutModalProps {
    selectedPlan: PricingPlan;
    billingCycle: 'monthly' | 'yearly';
    tenantInfo: TenantInfo;
    paymentInfo: PaymentInfo;
    onClose: () => void;
    onPaymentInfoChange: (info: PaymentInfo) => void;
    onSubmit: (e: React.FormEvent) => void;
    getPrice: (plan: PricingPlan) => string;
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
    const isFreePlan = selectedPlan.id === 'free';
    const [currentStep, setCurrentStep] = useState(1);
    const [copiedText, setCopiedText] = useState('');

    const steps = isFreePlan
        ? [
            { number: 2, title: 'Review', icon: Check }
        ]
        : [
            { number: 1, title: 'Payment', icon: Banknote },
            { number: 2, title: 'Review', icon: Check }
        ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(''), 2000);
    };

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

        if (currentStep === steps.length)
            onSubmit(e);
        else handleNext();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl my-8">
                <div className="relative rounded-t-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white px-8 pt-6 pb-0.5">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                        type="button"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">
                            {isFreePlan ? 'Get Started Free' : 'Subscribe to ' + selectedPlan.name}
                        </h2>
                        <p className="text-blue-100 text-lg">
                            {isFreePlan ? 'No credit card required' : `${getPrice(selectedPlan)}/${billingCycle === 'monthly' ? 'mo' : 'yr'}`}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="p-8">

                    {currentStep === 2 && <div className="flex items-center gap-3 mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Review & Confirm</h3>
                            <p className="text-sm text-gray-500">Please review your information before submitting</p>
                        </div>
                    </div>}

                    {currentStep === 1 && !isFreePlan && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-900">
                                        <p className="font-semibold mb-2">Payment Instructions:</p>
                                        <ol className="list-decimal ml-4 space-y-2">
                                            <li>
                                                <span className="font-medium">Choose your preferred payment method below:</span>
                                                <ul className="list-disc ml-5 mt-1.5 space-y-1">
                                                    <li className="flex items-center justify-between gap-2">
                                                        <span>Airtel Money: <strong className="font-mono">265999883377</strong></span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard('265999883377')}
                                                            className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-700 text-xs rounded transition-all"
                                                        >
                                                            {copiedText === '265999883377' ? (
                                                                <Fragment>
                                                                    <Check className="w-3 h-3" />
                                                                    Copied
                                                                </Fragment>
                                                            ) : (
                                                                <Fragment>
                                                                    <Copy className="w-3 h-3" />
                                                                    Copy
                                                                </Fragment>
                                                            )}
                                                        </button>
                                                    </li>
                                                    <li className="flex items-center justify-between gap-2">
                                                        <span>MPamba (TNM): <strong className="font-mono">265882299339</strong></span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard('265882299339')}
                                                            className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-700 text-xs rounded transition-all"
                                                        >
                                                            {copiedText === '265882299339' ? (
                                                                <>
                                                                    <Check className="w-3 h-3" />
                                                                    Copied
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3 h-3" />
                                                                    Copy
                                                                </>
                                                            )}
                                                        </button>
                                                    </li>
                                                    <li className="flex items-center justify-between gap-2">
                                                        <span>Bank Transfer: <strong className="font-mono">1003356481</strong></span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard('1003356481')}
                                                            className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-700 text-xs rounded transition-all"
                                                        >
                                                            {copiedText === '1003356481' ? (
                                                                <>
                                                                    <Check className="w-3 h-3" />
                                                                    Copied
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3 h-3" />
                                                                    Copy
                                                                </>
                                                            )}
                                                        </button>
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>Send payment of <strong>{getPrice(selectedPlan)}</strong> to the provided account</li>
                                            <li>Keep your transaction reference number</li>
                                            <li>Enter the reference number in the field bottom</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    Enter Payment Reference
                                </h4>
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

                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
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
                                            <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                                                <span className="text-gray-600">Amount:</span>
                                                <span className="text-2xl font-bold text-blue-600">
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
                                        <span className="font-medium text-gray-900 text-right">{tenantInfo.phone}</span>
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

                            {/* <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-900">
                                        <p className="font-semibold mb-1">
                                            {isFreePlan ? 'Free Plan Terms' : 'Subscription Terms'}
                                        </p>
                                        <p>
                                            {isFreePlan
                                                ? 'The free plan includes basic features for local use. Cloud backup and sync require MK10,000/month hosting fee.'
                                                : 'Your subscription will be activated once we verify your payment. This usually takes 1-2 business hours. You will receive a confirmation email shortly.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div> */}
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
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-none'
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