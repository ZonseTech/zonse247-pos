import { FunctionComponent } from 'react';
import { HiOutlinePause } from 'react-icons/hi';
import { Button } from '../../../../components';
import { ErrorStateProps } from './types';

const ErrorState: FunctionComponent<ErrorStateProps> = ({
    error,
    onRetry,
}) => {
    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlinePause className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 mb-4">{error}</p>
            <Button
                onClick={onRetry}
                className="bg-amber-500 hover:bg-amber-500 text-white py-2 px-4 rounded-lg"
            >
                Try Again
            </Button>
        </div>
    );
};

export default ErrorState;
