import { FunctionComponent } from 'react';

const SalesLoadingState: FunctionComponent = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading sales...</p>
        </div>
    );
};

export default SalesLoadingState;
