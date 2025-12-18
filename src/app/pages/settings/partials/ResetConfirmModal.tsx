import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

interface ResetConfirmModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-none shadow-xl max-w-sm w-full">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900">
                            <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Reset Settings
                        </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to reset all settings to default values? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white transition-colors font-medium"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetConfirmModal;