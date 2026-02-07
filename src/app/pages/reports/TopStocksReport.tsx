import React, { useState, useEffect } from 'react'
import { formatCurrency } from '../../utils'
import reportsService, { TopStockItem, TopStocksResponse } from '../../services/reports.service'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import { ReportPieChart } from '../../components'

interface TopStocksReportProps {
    startDate?: Date | null
    endDate?: Date | null
}

const PIE_COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

const TopStocksReport: React.FC<TopStocksReportProps> = ({ startDate, endDate }) => {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<TopStocksResponse | null>(null)

    useEffect(() => {
        fetchTopStocks()
    }, [startDate, endDate])

    const fetchTopStocks = async () => {
        try {
            setLoading(true)
            const query: { startDate?: string; endDate?: string } = {}
            if (startDate) {
                query.startDate = dayjs(startDate).format('YYYY-MM-DD')
                query.endDate = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs(startDate).format('YYYY-MM-DD')
            }
            const response = await reportsService.getTopStocks(query)
            setData(response)
        } catch (err: any) {
            const axiosError = err?.error || err
            const serverMessage = axiosError?.response?.data?.message || axiosError?.message || 'Failed to fetch top stocks data'
            console.error('Error fetching top stocks:', axiosError?.response?.data || axiosError)
            toast.error(serverMessage)
        } finally {
            setLoading(false)
        }
    }

    const currentData: TopStockItem[] = data?.data || []
    const grandTotal = currentData.reduce((acc, item) => acc + item.pricing, 0)

    const pieChartData = currentData.slice(0, 5).map((item) => ({
        label: item.name,
        value: item.pricing,
    }))

    const formatTooltipValue = (value: number) => formatCurrency(value, true)

    if (loading) {
        return (
            <div className="space-y-4 px-4 py-4">
                <div className="bg-white dark:bg-gray-800 rounded-sm p-4 shadow-sm">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-sm p-4 shadow-sm">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 px-4 pt-4">
                <ReportPieChart
                    data={pieChartData}
                    height={220}
                    colors={PIE_COLORS}
                    tooltipFormatter={formatTooltipValue}
                />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
                <div className="space-y-3">
                    {currentData.map((item) => {
                        const percentage = grandTotal > 0 ? Math.round((item.pricing / grandTotal) * 100) : 0;

                        return (
                            <div key={item.name} className="bg-white dark:bg-gray-800 rounded-sm p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200 block">{item.name}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {item.quantity} x {formatCurrency(item.pricing, true)}
                                        </span>
                                    </span>
                                    <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                                        {formatCurrency(item.pricing * item.quantity, true)}
                                    </span>
                                </div>
                                <div className="relative h-3.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-sky-500 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <span
                                        className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${percentage > 49 ? 'text-white' : 'text-sky-600'}`}
                                    >
                                        {percentage}%
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default TopStocksReport
