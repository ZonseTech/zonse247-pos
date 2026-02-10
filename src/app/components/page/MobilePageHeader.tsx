import React, { PropsWithChildren, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import classNames from 'classnames';

interface MobilePageHeaderProps {
    /**
     * Page title - can be a string or a React component
     */
    title?: string | ReactNode;
    /**
     * Right side actions/components
     */
    rightContent?: ReactNode;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Whether to show the left button (default: true)
     */
    showLeftButton?: boolean;
    /**
     * Custom left button icon (default: ArrowLeft)
     */
    leftIcon?: ReactNode;
    /**
     * Custom left button handler (default: navigate back)
     */
    onLeftPress?: () => void;
    /**
     * Whether to hide the bottom border
     */
    noBorder?: boolean;
}

const MobilePageHeader: React.FC<PropsWithChildren<MobilePageHeaderProps>> = ({
    title,
    rightContent,
    children,
    className = '',
    showLeftButton = true,
    leftIcon,
    onLeftPress,
    noBorder = false,
}) => {
    const navigate = useNavigate();

    const handleLeftPress = () => {
        if (onLeftPress) {
            onLeftPress();
        } else {
            navigate(-1);
        }
    };

    const renderTitle = () => {
        if (!title) return null;

        if (typeof title === 'string') {
            return (
                <h1 className="text-lg font-semibold text-sky-500 dark:text-sky-100 truncate">
                    {title}
                </h1>
            );
        }

        return title;
    };

    return (
        <div
            className={classNames(
                'flex flex-col safe-area-top-android',
                !noBorder && 'border-b border-gray-200 dark:border-gray-700',
                className
            )}
        >
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 min-h-[52px]">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {showLeftButton && (
                        <button
                            onClick={handleLeftPress}
                            className="flex-shrink-0 p-1.5 -ml-1.5 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
                            aria-label={leftIcon ? "Menu" : "Go back"}
                        >
                            {leftIcon || <ArrowLeft className="w-5 h-5 text-sky-500 dark:text-sky-400" />}
                        </button>
                    )}
                    <div className="flex-1 min-w-0">
                        {renderTitle()}
                    </div>
                </div>

                {rightContent && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {rightContent}
                    </div>
                )}
            </div>

            {children && (
                <div className="px-3 pb-2">
                    {children}
                </div>
            )}
        </div>
    );
};

export default MobilePageHeader;
