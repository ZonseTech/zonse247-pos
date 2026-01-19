import { FC } from 'react';
import { Users, UserCheck, UserX, ShieldAlert, LucideIcon } from 'lucide-react';

export interface UserSummaryCard {
    title: string;
    value: number;
    displayValue?: string;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
    icon?: 'total' | 'active' | 'inactive' | 'suspended';
}

interface UserSummaryCardsProps {
    cards: UserSummaryCard[];
    isLoading?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    total: Users,
    active: UserCheck,
    inactive: UserX,
    suspended: ShieldAlert,
};

const UserSummaryCards: FC<UserSummaryCardsProps> = ({ cards, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-3 animate-pulse">
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3">
                            <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-600 rounded-md sm:rounded-lg" />
                            <div className="flex flex-col items-center sm:items-start space-y-1 sm:space-y-2">
                                <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-600 rounded w-8 sm:w-16" />
                                <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-600 rounded w-6 sm:w-10" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            {cards.map((card, index) => {
                const IconComponent = card.icon ? iconMap[card.icon] : Users;
                return (
                    <div
                        key={index}
                        className={`${card.bgColor} rounded-lg sm:rounded-xl p-2 sm:p-3 transition-all duration-200 hover:shadow-md`}
                    >
                        {/* Mobile: Stacked layout, Desktop: Horizontal layout */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3">
                            <div className={`w-6 h-6 sm:w-10 sm:h-10 ${card.iconBgColor} rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <IconComponent className={`w-3 h-3 sm:w-5 sm:h-5 ${card.textColor}`} />
                            </div>
                            <div className="min-w-0 text-center sm:text-left">
                                <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400 truncate leading-tight">{card.title}</p>
                                <p className={`text-sm sm:text-lg font-bold ${card.textColor} leading-tight`}>
                                    {card.displayValue ?? card.value}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UserSummaryCards;
