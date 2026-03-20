import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Inventory = lazy(() => import('../../pages/inventory'))
const MobileInventory = lazy(() => import('../../pages/inventory/MobileInventory'))
const MobileStocks = lazy(() => import('../../pages/inventory/MobileStocks'))
const InventoryForm = lazy(() => import('../../pages/inventory/create'))
const StockMovements = lazy(() => import('../../pages/stock-movements'))
const InventoryValuation = lazy(() => import('../../pages/inventory-valuation'))
const COGSProfitability = lazy(() => import('../../pages/cogs-profitability'))
const InventoryAging = lazy(() => import('../../pages/inventory-aging'))
const Categories = lazy(() => import('../../pages/categories'))

export const InventoryRoutes = (
    <>
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
