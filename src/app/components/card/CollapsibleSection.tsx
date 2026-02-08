import { FunctionComponent, ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    iconBgColor: string;
    iconBorderColor: string;
    iconTextColor: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleSection: FunctionComponent<CollapsibleSectionProps> = ({
    title,
    subtitle,
    icon,
    iconBgColor,
    iconBorderColor,
    iconTextColor,
    children,
    defaultOpen = true,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${iconBgColor} border-2 ${iconBorderColor} ${iconTextColor} font-semibold text-sm shadow-sm`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                    </div>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
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
