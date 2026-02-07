import React, { useState, useEffect } from 'react'
import { formatCurrency } from '../../utils'
import reportsService, { TotalSalesDataPoint, TotalSalesResponse } from '../../services/reports.service'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import { ReportBarChart, ReportProgressBar } from '../../components'

type TabType = 'hourly' | 'weekly' | 'monthly'

interface TotalSalesReportProps {
    startDate?: Date | null
    endDate?: Date | null
}

const TotalSalesReport: React.FC<TotalSalesReportProps> = ({ startDate, endDate }) => {
    const [activeTab, setActiveTab] = useState<TabType>('hourly')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<TotalSalesResponse | null>(null)

    useEffect(() => {
        fetchTotalSales()
    }, [startDate, endDate])

    const fetchTotalSales = async () => {
        try {
            setLoading(true)
            const query: { startDate?: string; endDate?: string } = {}
            if (startDate) {
                query.startDate = dayjs(startDate).format('YYYY-MM-DD')
                query.endDate = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs(startDate).format('YYYY-MM-DD')
            }
            const response = await reportsService.getTotalSales(query)
            setData(response)
        } catch (err: any) {
            const axiosError = err?.error || err
            const serverMessage = axiosError?.response?.data?.message || axiosError?.message || 'Failed to fetch total sales data'
            console.error('Error fetching total sales:', axiosError?.response?.data || axiosError)
            toast.error(serverMessage)
        } finally {
            setLoading(false)
        }
    }

    const currentData: TotalSalesDataPoint[] = data?.[activeTab]?.data || []
    const grandTotal = currentData.reduce((acc, item) => acc + item.value, 0)

    const formatTooltipValue = (value: number) => formatCurrency(value, true)

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex bg-white dark:bg-gray-800 rounded-none shadow-none">
                    {(['hourly', 'weekly', 'monthly'] as TabType[]).map((tab) => (
                        <div key={tab} className="flex-1 py-3 px-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
                <div className="px-4 space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-sm p-4 shadow-sm">
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-sm p-4 shadow-sm">
                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 sticky top-0 z-10 bg-white dark:bg-gray-800">
                <div className="flex rounded-none shadow-none">
                    {(['hourly', 'weekly', 'monthly'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 px-3 text-sm font-medium uppercase transition-colors ${activeTab === tab
                                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-b-2 border-transparent'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-shrink-0 px-4 pt-4">
                <ReportBarChart
                    data={currentData}
                    tooltipFormatter={formatTooltipValue}
                />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
                <div className="space-y-3">
                    {currentData.map((item) => {
                        const percentage = grandTotal > 0 ? Math.round((item.value / grandTotal) * 100) : 0
                        return (
                            <ReportProgressBar
                                key={item.label}
                                label={item.label}
                                value={formatCurrency(item.value, true)}
                                percentage={percentage}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default TotalSalesReport
