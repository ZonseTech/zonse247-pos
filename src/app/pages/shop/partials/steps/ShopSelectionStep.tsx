import { Store } from "lucide-react";
import StatusBadge from "../StatusBadge";

const ShopSelectionStep = ({ shops, onShopSelect, loading }) => (
    <div className="space-y-6">
        <div className="text-center">
            <Store className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Shop</h2>
            <p className="text-gray-600">Choose the shop for this POS machine</p>
        </div>

        <div className="grid gap-4">
            {shops.map((shop) => (
                <div
                    key={shop.id}
                    onClick={() => onShopSelect(shop)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                            <p className="text-gray-600 text-sm">{shop.location}</p>
                        </div>
                        <StatusBadge status={shop.status} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default ShopSelectionStep