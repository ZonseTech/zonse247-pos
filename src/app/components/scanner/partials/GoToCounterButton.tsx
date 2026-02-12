import { ShoppingCart } from 'lucide-react';
import { FunctionComponent } from 'react';

interface GoToCounterButtonProps {
    totalCount: number;
    onClick: () => void;
}

const GoToCounterButton: FunctionComponent<GoToCounterButtonProps> = ({
    totalCount,
    onClick,
}) => {
    if (totalCount === 0) return null;

    return (
        <div className="relative z-10 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button
                onClick={onClick}
                className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-98"
            >
                <ShoppingCart className="w-5 h-5" />
                <span className="uppercase tracking-wide">Go To Counter ({totalCount} Items)</span>
            </button>
        </div>
    );
};

export default GoToCounterButton;
