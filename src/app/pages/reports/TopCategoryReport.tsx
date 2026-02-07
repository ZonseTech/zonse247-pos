import React from 'react'
import MobileReportDetailLayout from './MobileReportDetailLayout'

interface CategoryData {
    name: string
    sales: string
    items: number
    percentage: number
}

const categories: CategoryData[] = [
    { name: 'Electronics', sales: 'KES 8.2M', items: 156, percentage: 45 },
    { name: 'Accessories', sales: 'KES 3.1M', items: 234, percentage: 22 },
    { name: 'Wearables', sales: 'KES 2.4M', items: 89, percentage: 15 },
    { name: 'Home & Office', sales: 'KES 1.8M', items: 67, percentage: 10 },
    { name: 'Gaming', sales: 'KES 1.2M', items: 45, percentage: 8 },
]

const TopCategoryReport: React.FC = () => {
    return (
        <MobileReportDetailLayout title="Top Category">
            <div className="px-4 space-y-4">
                {/* Summary Card */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-500 text-sm">Highest Selling Category</p>
                    <p className="text-3xl font-bold text-primary-600">Electronics</p>
                    <p className="text-gray-400 text-xs mt-1">45% of total sales</p>
                </div>

                {/* Categories List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h3 className="font-semibold text-gray-800 p-4 border-b">Category Performance</h3>
                    <div className="divide-y">
                        {categories.map((category, index) => (
                            <div key={index} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-800">{category.name}</span>
                                    <span className="font-semibold text-primary-600">{category.sales}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 rounded-full"
                                            style={{ width: `${category.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 w-10">{category.percentage}%</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{category.items} items sold</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MobileReportDetailLayout>
    )
}

export default TopCategoryReport
