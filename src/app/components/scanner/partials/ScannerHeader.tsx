import { ArrowLeft, Search } from 'lucide-react';
import { FunctionComponent } from 'react';

interface ScannerHeaderProps {
    onClose: () => void;
    onSearch?: () => void;
}

const ScannerHeader: FunctionComponent<ScannerHeaderProps> = ({
    onClose,
    onSearch,
}) => {
    return (
        <header className="relative z-10 flex items-center justify-between p-4 pt-[env(safe-area-inset-top,16px)] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <button
                onClick={onClose}
                className="p-2 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-sm transition-all duration-300 active:scale-95"
            >
                <ArrowLeft className="w-6 h-6 text-sky-500" />
            </button>
            <button
                onClick={onSearch}
                className="p-2 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-sm transition-all duration-300 active:scale-95"
            >
                <Search className="w-6 h-6 text-sky-500" />
            </button>
        </header>
    );
};

export default ScannerHeader;
