import React from 'react';

interface FilterProps {
    label: string;
    options: string[];
    defaultValue?: string;
}

const StatusFilter: React.FC<FilterProps> = ({ label, options }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-gray-600">{label}</span>
            <div className="relative">
                <select className="bg-gray-100 border border-gray-200 rounded-md py-2 px-4 appearance-none pr-8 text-gray-700">
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default StatusFilter;