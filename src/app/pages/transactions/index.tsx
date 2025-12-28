import { FC, useState } from "react";
import TransactionsDataTable from "./partials/TransactionsDataTable";
import ProductsTable from "./partials/ProductsTable";
import AppLayout from "../../layouts/AppLayout";
import StatCard from "../../components/card/StatCard";
import PageHeader from "../../components/page/PageHeader";
import { ReceiptEuroIcon } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "../../utils/constants";
import { HiOutlinePlus } from "react-icons/hi";

const TransactionsPage: FC = () => {
    const [showProducts, setShowProducts] = useState(false);
    const [soldProducts, setSoldProducts] = useState<CartItem[]>([]);

    const [summaryData, setSummaryData] = useState<Array<{
        title: string;
        value: number | string;
        bgColor: string;
        onClick?: () => void;
    }>>([
        { title: 'Sales', value: 0, bgColor: 'bg-green-500' },
        { title: 'Transactions', value: 0, bgColor: 'bg-green-400' },
        { title: 'Items Sold', value: 0, bgColor: 'bg-yellow-400' },
        {
            title: 'Products',
            value: 0,
            bgColor: 'bg-green-400',
        },
    ]);

    return (
        <AppLayout>
            <div className="min-h-screen space-y-4">

                <PageHeader
                    title="Transactions"
                    description="Manage and view all transactions"
                    icon={<ReceiptEuroIcon className="w-8 h-8 text-blue-600" />}
                    action={
                        <Link to={ROUTES.POS}>
                            <HiOutlinePlus className="w-5 h-5" />
                        </Link>
                    }
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {summaryData.map((card, index) => (
                        <StatCard
                            key={index}
                            label={card.title}
                            value={card.value.toString()}
                            bgColor={card.bgColor}
                            onClick={card.onClick}
                        />
                    ))}
                </div>

                {showProducts ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TransactionsDataTable
                            setSummaryData={setSummaryData}
                            setSoldProducts={setSoldProducts}
                            showProducts={showProducts}
                            setShowProducts={setShowProducts}
                        />
                        <ProductsTable soldProducts={soldProducts} />
                    </div>
                ) : (
                    <TransactionsDataTable
                        showProducts={showProducts}
                        setShowProducts={setShowProducts}
                        setSummaryData={setSummaryData}
                        setSoldProducts={setSoldProducts}
                    />
                )}
            </div>
        </AppLayout>
    );
};

export default TransactionsPage;