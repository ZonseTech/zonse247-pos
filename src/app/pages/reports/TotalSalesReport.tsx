import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils'
import reportsService, { TotalSalesDataPoint, TotalSalesResponse } from '../../services/reports.service'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

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
        <div className="space-y-4">
            <div className="flex bg-white dark:bg-gray-800 rounded-none shadow-none">
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

            <div className="px-4 space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-sm p-4 shadow-sm">
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={currentData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickLine={false}
                                    tickFormatter={(value) => value.toLocaleString()}
                                />
                                <Tooltip
                                    formatter={formatTooltipValue}
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '12px',
                                    }}
                                    labelStyle={{ color: '#9ca3af' }}
                                />
                                <Bar dataKey="value" name="Sales" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-3">
                    {currentData.map((item) => {
                        const percentage = grandTotal > 0 ? Math.round((item.value / grandTotal) * 100) : 0
                        return (
                            <div key={item.label} className="bg-white dark:bg-gray-800 rounded-sm p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {formatCurrency(item.value, true)}
                                    </span>
                                </div>
                                <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-sky-500 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
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

export default TotalSalesReport
