import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Inventory = lazy(() => import('../../pages/inventory'))
const MobileInventory = lazy(() => import('../../pages/inventory/MobileInventory'))
const MobileStocks = lazy(() => import('../../pages/inventory/MobileStocks'))
const InventoryForm = lazy(() => import('../../pages/inventory/create'))
const StockMovements = lazy(() => import('../../pages/stock-movements'))
const Categories = lazy(() => import('../../pages/categories'))

export const InventoryRoutes = (
    <>
        <Route path={ROUTES.INVENTORY} element={<Inventory />} />
        <Route path={ROUTES.INVENTORY_FORM} element={<InventoryForm />} />
        <Route path={ROUTES.MOBILE_INVENTORY} element={<MobileInventory />} />
        <Route path={ROUTES.STOCK_MOVEMENTS} element={<StockMovements />} />
        <Route path={ROUTES.CATEGORIES} element={<Categories />} />
    </>
)

export { MobileStocks }
