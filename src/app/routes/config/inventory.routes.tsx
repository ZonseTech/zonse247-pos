import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { ROUTES } from '../../utils/constants'
import PermissionRoute from '../../navigation/PermissionRoute'

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
        <Route path={ROUTES.INVENTORY_HUB} element={<PermissionRoute permission="inventory.view"><InventoryHubPage /></PermissionRoute>}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<PermissionRoute permission="inventory.view"><Inventory /></PermissionRoute>} />
            <Route path="categories" element={<PermissionRoute anyOf={['categories.view', 'inventory.view']}><Categories /></PermissionRoute>} />
            <Route path="stock-movements" element={<PermissionRoute permission="inventory.view"><StockMovements /></PermissionRoute>} />
            <Route path="valuation" element={<PermissionRoute permission="inventory.view"><InventoryValuation /></PermissionRoute>} />
            <Route path="cogs" element={<PermissionRoute permission="inventory.view"><COGSProfitability /></PermissionRoute>} />
            <Route path="aging" element={<PermissionRoute permission="inventory.view"><InventoryAging /></PermissionRoute>} />
            <Route path="charts" element={<PermissionRoute permission="inventory.view"><InventoryCharts /></PermissionRoute>} />
        </Route>
        <Route path={ROUTES.INVENTORY} element={<PermissionRoute permission="inventory.view"><Inventory /></PermissionRoute>} />
        <Route path={ROUTES.INVENTORY_FORM} element={<PermissionRoute anyOf={['products.create', 'products.edit', 'inventory.receive', 'inventory.adjust']}><InventoryForm /></PermissionRoute>} />
        <Route path={ROUTES.MOBILE_INVENTORY} element={<PermissionRoute permission="inventory.view"><MobileInventory /></PermissionRoute>} />
        <Route path={ROUTES.STOCK_MOVEMENTS} element={<PermissionRoute permission="inventory.view"><StockMovements /></PermissionRoute>} />
        <Route path={ROUTES.INVENTORY_VALUATION} element={<PermissionRoute permission="inventory.view"><InventoryValuation /></PermissionRoute>} />
        <Route path={ROUTES.COGS_PROFITABILITY} element={<PermissionRoute permission="inventory.view"><COGSProfitability /></PermissionRoute>} />
        <Route path={ROUTES.INVENTORY_AGING} element={<PermissionRoute permission="inventory.view"><InventoryAging /></PermissionRoute>} />
        <Route path={ROUTES.CATEGORIES} element={<PermissionRoute anyOf={['categories.view', 'inventory.view']}><Categories /></PermissionRoute>} />
    </>
)

export { MobileStocks }
