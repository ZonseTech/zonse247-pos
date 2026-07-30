import { type FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components';
import { ROUTES } from '../../utils/constants';

const Forbidden: FunctionComponent = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-md w-full space-y-8">
                {/* Icon and Header */}
                <div className="text-center">
                    <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="h-12 w-12 text-red-500 dark:text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                        Access Denied
                    </h1>
                    <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
                        You don't have permission to view this page
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Lock className="h-5 w-5 text-red-500 dark:text-red-400" />
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            Restricted area
                        </div>
                    </div>
                    <div className="px-6 py-5">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Your account doesn't have the required permission to access this section.
                            If you believe this is a mistake, contact an administrator to have your
                            permissions reviewed.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <Button
                        theme="primary"
                        onClick={() => navigate(ROUTES.POS)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Go to POS
                    </Button>
                    <Button
                        theme="neutral"
                        layout="outline"
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                </div>

                {/* Support Message */}
                <div className="text-center pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Have questions? Contact our support team for assistance.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Forbidden;
