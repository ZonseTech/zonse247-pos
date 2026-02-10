import { FunctionComponent, ReactNode, useState } from 'react';

interface CollapsibleSectionProps {
    title: string;
    subtitle?: string;
    icon: ReactNode;
    iconBgColor?: string;
    iconBorderColor?: string;
    iconTextColor?: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleSection: FunctionComponent<CollapsibleSectionProps> = ({
    title,
    subtitle,
    icon,
    iconBgColor = 'bg-sky-500 dark:bg-sky-700',
    iconBorderColor = '',
    iconTextColor = 'text-sky-500 dark:text-sky-400',
    children,
    defaultOpen = true,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className={`rounded-sm shadow-sm overflow-hidden bg-white dark:bg-gray-800`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-4 text-left bg-white dark:bg-gray-800`}
            >
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center rounded-xs w-6 h-6 text-white dark:text-gray-400 ${iconBgColor} ${iconBorderColor ? iconBorderColor + ' border-2' : ''} ${iconTextColor} font-semibold text-sm shadow-none`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={isOpen}
                        onClick={handleCheckboxClick}
                        onChange={() => { }}
                        className="h-5 w-5 text-sky-500 border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700"
                    />
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4">
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleSection;
