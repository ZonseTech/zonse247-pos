import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Suppliers = lazy(() => import('../../pages/suppliers'))
const SupplierForm = lazy(() => import('../../pages/suppliers/create'))
const PurchaseOrders = lazy(() => import('../../pages/purchase-orders'))
const PurchaseOrderForm = lazy(() => import('../../pages/purchase-orders/create'))

export const SupplierRoutes = (
    <>
        <Route path={ROUTES.SUPPLIERS} element={<Suppliers />} />
        <Route path={ROUTES.SUPPLIER_FORM} element={<SupplierForm />} />
        <Route path={ROUTES.PURCHASE_ORDERS} element={<PurchaseOrders />} />
        <Route path={ROUTES.PURCHASE_ORDER_FORM} element={<PurchaseOrderForm />} />
    </>
)
