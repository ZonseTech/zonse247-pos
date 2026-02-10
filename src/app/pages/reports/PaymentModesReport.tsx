import React, { useState, useEffect } from 'react'
import { formatCurrency } from '../../utils'
import reportsService, { PaymentModeDataPoint, PaymentModesResponse } from '../../services/reports.service'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import { ReportPieChart, ReportProgressBar } from '../../components'

interface PaymentModesReportProps {
    startDate?: Date | null
    endDate?: Date | null
}

const PIE_COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

const PaymentModesReport: React.FC<PaymentModesReportProps> = ({ startDate, endDate }) => {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<PaymentModesResponse | null>(null)

    useEffect(() => {
        fetchPaymentModes()
    }, [startDate, endDate])

    const fetchPaymentModes = async () => {
        try {
            setLoading(true)
            const query: { startDate?: string; endDate?: string } = {}
            if (startDate) {
                query.startDate = dayjs(startDate).format('YYYY-MM-DD')
                query.endDate = endDate ? dayjs(endDate).format('YYYY-MM-DD') : dayjs(startDate).format('YYYY-MM-DD')
            }
            const response = await reportsService.getPaymentModes(query)
            setData(response)
        } catch (err: any) {
            const axiosError = err?.error || err
            const serverMessage = axiosError?.response?.data?.message || axiosError?.message || 'Failed to fetch payment modes data'
            console.error('Error fetching payment modes:', axiosError?.response?.data || axiosError)
            toast.error(serverMessage)
        } finally {
            setLoading(false)
        }
    }

    const currentData: PaymentModeDataPoint[] = data?.data || []
    const grandTotal = currentData.reduce((acc, item) => acc + item.value, 0)

    const pieChartData = currentData.map((item) => ({
        label: item.label,
        value: item.value,
    }))

    const formatTooltipValue = (value: number) => formatCurrency(value, true)

    if (loading) {
        return (
            <div className="space-y-4 px-4 py-4">
                <div className="bg-white dark:bg-gray-800 rounded-sm p-4 shadow-sm">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                {[1, 2, 3, 4].map((i) => (
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
                        const percentage = grandTotal > 0 ? Math.round((item.value / grandTotal) * 100) : 0
                        return (
                            <ReportProgressBar
                                key={item.label}
                                label={item.label}
                                value={formatCurrency(item.value, true)}
                                percentage={percentage}
                                barColor="bg-sky-500"
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default PaymentModesReport
