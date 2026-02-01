import React from 'react';
import { HiChevronRight } from 'react-icons/hi';

export interface ReportCardProps {
    name: string;
    value: string;
    description: string;
    onClick?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ name, value, description, onClick }) => (
    <div
        onClick={onClick}
        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-sm p-3.5 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform cursor-pointer"
    >
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {name}
            </span>
            <span className="text-lg font-semibold text-sky-600 dark:text-sky-400">
                {value}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {description}
            </span>
        </div>
        <HiChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-3" />
    </div>
);

export default ReportCard;
