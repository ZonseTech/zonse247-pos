import React from 'react'

export interface ReportProgressBarProps {
    label: string
    value: string
    subtitle?: string
    percentage: number
    barColor?: string
    barColorHex?: string
    className?: string
    showLabel?: boolean
    /** Drop the card's own bg/rounded/shadow wrapper — use when nested inside another card (e.g. ReportDetailView's Panel). */
    bare?: boolean
}

const ReportProgressBar: React.FC<ReportProgressBarProps> = ({
    label,
    value,
    subtitle,
    percentage,
    barColor = 'bg-sky-500',
    barColorHex,
    className = '',
    showLabel = true,
    bare = false,
}) => {
    return (
        <div className={`${showLabel && !bare ? 'bg-white dark:bg-gray-800 rounded-sm p-4 shadow-sm' : ''} ${className}`}>
            {showLabel && (
                <div className="flex justify-between items-center mb-2">
                    <span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">{label}</span>
                        {subtitle && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</span>
                        )}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {value}
                    </span>
                </div>
            )}
            <div className="relative h-3.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${barColorHex ? '' : barColor} rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%`, ...(barColorHex ? { backgroundColor: barColorHex } : {}) }}
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
