import { FunctionComponent, ReactNode } from 'react';
import { BsFilter } from "react-icons/bs";

interface FloatingFilterButtonProps {
    onClick: () => void;
    isActive?: boolean;
    activeCount?: number;
    icon?: ReactNode;
    label?: string;
    className?: string;
}

const FloatingFilterButton: FunctionComponent<FloatingFilterButtonProps> = ({
    onClick,
    isActive = false,
    activeCount,
    icon,
    label,
    className = '',
}) => {
    const hasLabel = isActive && label;

    return (
        <div className={`fixed bottom-16 right-4 z-40 ${className}`}>
            <button
                onClick={onClick}
                className={`rounded-full shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${hasLabel ? 'px-4 h-12' : 'w-14 h-14'
                    } bg-sky-500 text-white active:bg-sky-700`}
            >
                {icon || <BsFilter className="w-6 h-6" />}
                {hasLabel && (
                    <span className="text-sm font-medium whitespace-nowrap">
                        {label}
                    </span>
                )}
                {!hasLabel && activeCount && activeCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {activeCount}
                    </span>
                )}
            </button>
        </div>
    );
};

export default FloatingFilterButton;
