import { FunctionComponent } from 'react';
import { Receipt } from 'lucide-react';

const SalesEmptyState: FunctionComponent = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Receipt className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No sales today
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Sales made today will appear here
            </p>
        </div>
    );
};

export default SalesEmptyState;
