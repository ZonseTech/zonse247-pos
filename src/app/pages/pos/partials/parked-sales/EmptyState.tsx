import { FunctionComponent } from 'react';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { EmptyStateProps } from './types';

const EmptyState: FunctionComponent<EmptyStateProps> = ({
    message = "No parked sales",
    subMessage = "Sales you park will appear here",
}) => {
    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">{message}</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{subMessage}</p>
        </div>
    );
};

export default EmptyState;
