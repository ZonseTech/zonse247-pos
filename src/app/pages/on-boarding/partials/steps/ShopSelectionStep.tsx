import { AlertCircle } from "lucide-react";
import StatusBadge from "../StatusBadge";
import { FunctionComponent } from "react";

const ShopSelectionStep: FunctionComponent<{ shops: Array<IShop>, onShopSelect }> = ({ shops, onShopSelect }) => (
    <div className="space-y-6">
        {shops.length > 0 && <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Shop</h2>
            <p className="text-gray-600">Choose the shop for this POS machine</p>
        </div>}

        <div className="grid gap-4">
            {shops && shops.length > 0 ? (
                shops.map((shop) => (
                    <div
                        key={shop.uuid}
                        onClick={() => onShopSelect(shop)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                                <p className="text-gray-600 text-sm">{shop.description || '--'}</p>
                            </div>
                            <StatusBadge status={shop.status} />
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Shops Found</h3>
                    <p className="text-gray-500 mb-4">
                        No shops are available for your account at this time.
                    </p>
                    <p className="text-sm text-gray-400">
                        Please contact your administrator to set up shops for your account.
                    </p>
                </div>
            )}
        </div>
    </div>
);

export default ShopSelectionStep;