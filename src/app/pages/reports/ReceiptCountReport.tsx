import React from 'react'
import MobileReportDetailLayout from './MobileReportDetailLayout'
import { formatCurrency } from '../../utils'

interface ReceiptSummary {
    label: string
    count: number
    amount: string
}

const receiptSummary: ReceiptSummary[] = [
    { label: 'Completed', count: 145, amount: formatCurrency(1150000, true) },
    { label: 'Refunded', count: 8, amount: formatCurrency(45000, true) },
    { label: 'Voided', count: 3, amount: formatCurrency(15000, true) },
]

const ReceiptCountReport: React.FC = () => {
    return (
        <MobileReportDetailLayout title="Receipt Count">
            <div className="px-4 space-y-4">
                {/* Summary Card */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Transactions</p>
                    <p className="text-3xl font-bold text-primary-600">156</p>
                    <p className="text-gray-400 text-xs mt-1">Number of completed transactions</p>
                </div>

                {/* Transaction Breakdown */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h3 className="font-semibold text-gray-800 p-4 border-b">Transaction Summary</h3>
                    <div className="divide-y">
                        {receiptSummary.map((item, index) => (
                            <div key={index} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">{item.label}</p>
                                    <p className="text-xs text-gray-500">{item.count} receipts</p>
                                </div>
                                <span className="font-semibold text-gray-800">{item.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-gray-500 text-xs">Avg. Transaction</p>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(8013, true)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-gray-500 text-xs">Peak Hour</p>
                        <p className="text-xl font-bold text-gray-800">2:00 PM</p>
                    </div>
                </div>

                {/* Hourly Distribution */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">Hourly Distribution</h3>
                    <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Chart placeholder
                    </div>
                </div>
            </div>
        </MobileReportDetailLayout>
    )
}

export default ReceiptCountReport
