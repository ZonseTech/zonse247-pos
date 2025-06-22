import { Loader2 } from 'lucide-react';
import { FunctionComponent } from 'react';

export const LoadingState: FunctionComponent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Loader2 className="mx-auto h-16 w-16 text-blue-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading categories...</h3>
        <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch your categories</p>
    </div>
);