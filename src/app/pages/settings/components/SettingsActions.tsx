import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { Button } from '../../../components';

interface SettingsActionsProps {
    isSubmitting: boolean;
    onReset: () => void;
}

const SettingsActions: React.FC<SettingsActionsProps> = ({ isSubmitting, onReset }) => {
    return (
        <>
            <div className="hidden sm:flex mt-8 items-center justify-between">
                <Button
                    type="button"
                    onClick={onReset}
                    theme='danger'
                >
                    Reset to Default
                </Button>
                <Button
                    type="submit"
                    loading={isSubmitting}
                    className="px-8"
                >
                    Save Settings
                </Button>
            </div>

            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 flex gap-3 z-20 safe-area-pb">
                <Button
                    type="button"
                    onClick={onReset}
                    theme='danger'
                >
                    <HiOutlineExclamationTriangle className="w-4 h-4" />
                    <span>Reset</span>
                </Button>
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