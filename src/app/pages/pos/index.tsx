import { FunctionComponent } from "react";
import Panel from "../../components/Panel";
import CartTable from "./partials/CartTable";
import AppLayout from "../../layouts/AppLayout";
import BarcodeScanner from "./partials/BarcodeScanner";
import CustomerFilter from "./partials/CustomerFilter";
import ProductsViewGrid from "./partials/ProductsViewGrid";

const Home: FunctionComponent = () => {
    return (
        <AppLayout>
            <div className="flex h-full gap-4 pb-4">
                <Panel>
                    <CustomerFilter />
                    <BarcodeScanner />
                    <CartTable />
                </Panel>

                <Panel>
                    <ProductsViewGrid />
                </Panel>
            </div>
        </AppLayout>
    )
}

export default Home