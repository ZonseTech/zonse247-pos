import { FunctionComponent } from 'react';
import { Receipt } from 'lucide-react';
import MobilePageHeader from '../../../../components/page/MobilePageHeader';

interface ReceiptLoadingStateProps {
    onBack: () => void;
}

export const ReceiptLoadingState: FunctionComponent<ReceiptLoadingStateProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    title="Receipt"
                    onLeftPress={onBack}
                    className="bg-white dark:bg-gray-800"
                />
            </div>
            <div className="flex-1 flex items-center justify-center pt-[60px]">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading receipt...</p>
                </div>
            </div>
        </div>
    );
};

interface ReceiptErrorStateProps {
    error?: string | null;
    onBack: () => void;
}

export const ReceiptErrorState: FunctionComponent<ReceiptErrorStateProps> = ({ error, onBack }) => {
    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    title="Receipt"
                    onLeftPress={onBack}
                    className="bg-white dark:bg-gray-800"
                />
            </div>
            <div className="flex-1 flex items-center justify-center pt-[60px]">
                <div className="text-center px-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {error || 'Receipt not found'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Unable to load receipt details. Please try again.
                    </p>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg active:scale-95 transition-transform"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};
