import React from 'react'

export interface ReportProgressBarProps {
    label: string
    value: string
    percentage: number
    barColor?: string
    className?: string
}

const ReportProgressBar: React.FC<ReportProgressBarProps> = ({
    label,
    value,
    percentage,
    barColor = 'bg-sky-500',
    className = '',
}) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-sm p-4 shadow-sm ${className}`}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {value}
                </span>
            </div>
            <div className="relative h-3.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${barColor} rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
                <span
                    className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${percentage > 49 ? 'text-white' : 'text-sky-600'
                        }`}
                >
                    {percentage}%
                </span>
            </div>
        </div>
    )
}

export default ReportProgressBar
