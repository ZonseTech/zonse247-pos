import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { Button } from '../../../components';

interface SettingsActionsProps {
    isSubmitting: boolean;
    onReset: () => void;
}

const SettingsActions: React.FC<SettingsActionsProps> = ({ isSubmitting, onReset }) => {
    return (
        <>
            {/* Desktop actions - inline */}
            <div className="hidden sm:flex mt-8 items-center justify-between">
                <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium rounded-lg"
                >
                    <HiOutlineExclamationTriangle className="w-5 h-5" />
                    Reset to Default
                </button>
                <Button
                    type="submit"
                    loading={isSubmitting}
                    className="px-8"
                >
                    Save Settings
                </Button>
            </div>

            {/* Mobile actions - fixed bottom bar */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 flex gap-3 z-20 safe-area-pb">
                <button
                    type="button"
                    onClick={onReset}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium rounded-lg text-sm"
                >
                    <HiOutlineExclamationTriangle className="w-4 h-4" />
                    <span>Reset</span>
                </button>
                <Button
                    type="submit"
                    loading={isSubmitting}
                    className="flex-1 py-3 text-sm"
                >
                    Save Settings
                </Button>
            </div>
        </>
    );
};

export default SettingsActions;