import React from 'react'
import MobileReportDetailLayout from './MobileReportDetailLayout'
import { formatCurrency } from '../../utils'
import { HiCash, HiCreditCard, HiOfficeBuilding, HiSwitchHorizontal } from 'react-icons/hi'

interface PaymentMethod {
    name: string
    icon: React.ReactNode
    transactions: number
    amount: string
    percentage: number
}

const paymentMethods: PaymentMethod[] = [
    {
        name: 'Cash',
        icon: <HiCash className="w-6 h-6" />,
        transactions: 78,
        amount: formatCurrency(620000, true),
        percentage: 50,
    },
    {
        name: 'M-Pesa / E-Pay',
        icon: <HiCreditCard className="w-6 h-6" />,
        transactions: 52,
        amount: formatCurrency(380000, true),
        percentage: 30,
    },
    {
        name: 'Bank Transfer',
        icon: <HiOfficeBuilding className="w-6 h-6" />,
        transactions: 18,
        amount: formatCurrency(200000, true),
        percentage: 16,
    },
    {
        name: 'Split Payment',
        icon: <HiSwitchHorizontal className="w-6 h-6" />,
        transactions: 8,
        amount: formatCurrency(50000, true),
        percentage: 4,
    },
]

const PaymentModesReport: React.FC = () => {
    return (
        <MobileReportDetailLayout title="Payment Modes">
            <div className="px-4 space-y-4">
                {/* Summary Card */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-500 text-sm">Payment Methods Used</p>
                    <p className="text-3xl font-bold text-primary-600">4 methods</p>
                    <p className="text-gray-400 text-xs mt-1">Cash, E-Pay, Bank, Split payments</p>
                </div>

                {/* Payment Methods List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h3 className="font-semibold text-gray-800 p-4 border-b">Payment Breakdown</h3>
                    <div className="divide-y">
                        {paymentMethods.map((method, index) => (
                            <div key={index} className="p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                                        {method.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{method.name}</p>
                                        <p className="text-xs text-gray-500">{method.transactions} transactions</p>
                                    </div>
                                    <span className="font-semibold text-gray-800">{method.amount}</span>
                                </div>
                                <div className="flex items-center gap-3 ml-13">
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 rounded-full"
                                            style={{ width: `${method.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 w-10">{method.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">Payment Distribution</h3>
                    <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Pie chart placeholder
                    </div>
                </div>
            </div>
        </MobileReportDetailLayout>
    )
}

export default PaymentModesReport
