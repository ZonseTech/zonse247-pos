import React from 'react'
import MobileReportDetailLayout from './MobileReportDetailLayout'
import { formatCurrency } from '../../utils'

const GrossProfitReport: React.FC = () => {
    return (
        <MobileReportDetailLayout title="Gross Profit">
            <div className="px-4 space-y-4">
                {/* Summary Card */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-500 text-sm">Gross Profit</p>
                    <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(450000, true)}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Selling price minus cost price</p>
                </div>

                {/* Profit Margin */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">Profit Analysis</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Revenue</span>
                            <span className="font-medium">{formatCurrency(1250000, true)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Cost of Goods</span>
                            <span className="font-medium text-red-500">-{formatCurrency(800000, true)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-semibold">Gross Profit</span>
                            <span className="font-bold text-green-600">{formatCurrency(450000, true)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Profit Margin</span>
                            <span className="font-medium text-green-600">36%</span>
                        </div>
                    </div>
                </div>

                {/* Placeholder for chart */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">Profit Trend</h3>
                    <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Chart placeholder
                    </div>
                </div>
            </div>
        </MobileReportDetailLayout>
    )
}

export default GrossProfitReport
