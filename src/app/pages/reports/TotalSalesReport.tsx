import React from 'react'
import MobileReportDetailLayout from './MobileReportDetailLayout'
import { formatCurrency } from '../../utils'

const TotalSalesReport: React.FC = () => {
    return (
        <MobileReportDetailLayout title="Total Sales">
            <div className="px-4 space-y-4">
                {/* Summary Card */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-primary-600">
                        {formatCurrency(1250000, true)}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Revenue from all transactions</p>
                </div>

                {/* Breakdown */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">Sales Breakdown</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Cash Sales</span>
                            <span className="font-medium">{formatCurrency(750000, true)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">E-Pay Sales</span>
                            <span className="font-medium">{formatCurrency(350000, true)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Bank Transfer</span>
                            <span className="font-medium">{formatCurrency(150000, true)}</span>
                        </div>
                    </div>
                </div>

                {/* Placeholder for chart */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">Sales Trend</h3>
                    <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Chart placeholder
                    </div>
                </div>
            </div>
        </MobileReportDetailLayout>
    )
}

export default TotalSalesReport
