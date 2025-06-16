import Card from './partials/Card';
import AppLayout from '../../layouts/AppLayout'
import { FunctionComponent, useState } from 'react'
import ProductsTable from './partials/ProductsTable';

const Products: FunctionComponent = () => {
    const [summaryData, setSummaryData] = useState([
        { title: 'Total Stock', value: 0, bgColor: 'bg-green-400', onClick: () => ({}) },
        { title: 'New Stock', value: 0, bgColor: 'bg-yellow-400', onClick: () => ({}) },
        { title: 'Expiring Soon', value: 0, bgColor: 'bg-cyan-400', onClick: () => ({}) },
        { title: 'Expired', value: 0, bgColor: 'bg-red-500', onClick: () => ({}) },
    ]);

    return (
        <AppLayout>
            <div className="min-h-screen">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                    {summaryData.map((card, index) => (
                        <Card
                            key={index}
                            title={card.title}
                            value={card.value}
                            bgColor={card.bgColor}
                            onClick={card.onClick}
                        />
                    ))}
                </div>

                <ProductsTable setSummaryData={setSummaryData} />
            </div>
        </AppLayout>
    )
}

export default Products