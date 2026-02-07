import React from 'react'

interface StockItem {
    name: string
    category: string
    sold: number
    revenue: string
}

const topStocks: StockItem[] = [
    { name: 'iPhone 15 Pro', category: 'Electronics', sold: 45, revenue: 'KES 2.7M' },
    { name: 'Samsung Galaxy S24', category: 'Electronics', sold: 38, revenue: 'KES 1.9M' },
    { name: 'MacBook Air M3', category: 'Electronics', sold: 22, revenue: 'KES 2.2M' },
    { name: 'AirPods Pro 2', category: 'Accessories', sold: 67, revenue: 'KES 670K' },
    { name: 'iPad Pro 12.9"', category: 'Electronics', sold: 18, revenue: 'KES 1.4M' },
    { name: 'Apple Watch Ultra', category: 'Wearables', sold: 25, revenue: 'KES 750K' },
]

const TopStocksReport: React.FC = () => {
    return (
        <div className="px-4 py-4 space-y-4">
            {/* Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Best Performing Items</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">24 items</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Based on sales volume</p>
            </div>

            {/* Top Stocks List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 p-4 border-b dark:border-gray-700">Top Performing Stocks</h3>
                <div className="divide-y dark:divide-gray-700">
                    {topStocks.map((item, index) => (
                        <div key={index} className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{item.revenue}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.sold} sold</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TopStocksReport
