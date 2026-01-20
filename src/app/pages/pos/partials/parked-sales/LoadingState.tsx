import { FunctionComponent } from 'react';
import { LoadingStateProps } from './types';

const LoadingState: FunctionComponent<LoadingStateProps> = ({
    message = "Loading parked sales...",
}) => {
    return (
        <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
        </div>
    );
};

export default LoadingState;
