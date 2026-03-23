import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const InventoryHubPage = lazy(() => import('../../pages/inventory-hub'))
const Inventory = lazy(() => import('../../pages/inventory'))
const MobileInventory = lazy(() => import('../../pages/inventory/MobileInventory'))
const MobileStocks = lazy(() => import('../../pages/inventory/MobileStocks'))
const InventoryForm = lazy(() => import('../../pages/inventory/create'))
const StockMovements = lazy(() => import('../../pages/stock-movements'))
const InventoryValuation = lazy(() => import('../../pages/inventory-valuation'))
const COGSProfitability = lazy(() => import('../../pages/cogs-profitability'))
const InventoryAging = lazy(() => import('../../pages/inventory-aging'))
const InventoryCharts = lazy(() => import('../../pages/inventory-charts'))
const Categories = lazy(() => import('../../pages/categories'))

export const InventoryRoutes = (
    <>
        <Route path={ROUTES.INVENTORY_HUB} element={<InventoryHubPage />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<Inventory />} />
            <Route path="categories" element={<Categories />} />
            <Route path="stock-movements" element={<StockMovements />} />
            <Route path="valuation" element={<InventoryValuation />} />
            <Route path="cogs" element={<COGSProfitability />} />
            <Route path="aging" element={<InventoryAging />} />
            <Route path="charts" element={<InventoryCharts />} />
        </Route>
        <Route path={ROUTES.INVENTORY} element={<Inventory />} />
        <Route path={ROUTES.INVENTORY_FORM} element={<InventoryForm />} />
        <Route path={ROUTES.MOBILE_INVENTORY} element={<MobileInventory />} />
        <Route path={ROUTES.STOCK_MOVEMENTS} element={<StockMovements />} />
        <Route path={ROUTES.INVENTORY_VALUATION} element={<InventoryValuation />} />
        <Route path={ROUTES.COGS_PROFITABILITY} element={<COGSProfitability />} />
        <Route path={ROUTES.INVENTORY_AGING} element={<InventoryAging />} />
        <Route path={ROUTES.CATEGORIES} element={<Categories />} />
    </>
)

export { MobileStocks }
