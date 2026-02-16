import { FunctionComponent, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import FormFieldCard from '../card/FormFieldCard';

interface NavigationCardProps {
    title: string;
    description: string;
    onClick: () => void;
    icon?: ReactNode;
}

const NavigationCard: FunctionComponent<NavigationCardProps> = ({
    title,
    description,
    onClick,
    icon,
}) => {
    return (
        <FormFieldCard
            onClick={onClick}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="flex-shrink-0">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {description}
                        </p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
        </FormFieldCard>
    );
};

export default NavigationCard;
