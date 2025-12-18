import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { Button } from '../../../components';

interface SettingsActionsProps {
    isSubmitting: boolean;
    onReset: () => void;
}

const SettingsActions: React.FC<SettingsActionsProps> = ({ isSubmitting, onReset }) => {
    return (
        <div className="mt-8 flex items-center justify-between">
            <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
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
    );
};

export default SettingsActions;