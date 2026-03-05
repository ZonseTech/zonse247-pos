import { FunctionComponent } from 'react';
import { Loader } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';

interface LoadingViewProps {
    message?: string;
}

/**
 * Loading view - displays a spinner while initializing
 */
const LoadingView: FunctionComponent<LoadingViewProps> = ({
    message = 'Checking onboarding status...',
}) => {
    return (
        <AuthLayout className="">
            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                <Loader className="w-10 h-10 text-sky-500 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
            </div>
        </AuthLayout>
    );
};

export default LoadingView;
