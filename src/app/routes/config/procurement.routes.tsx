import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { ROUTES } from '../../utils/constants'
import PermissionRoute from '../../navigation/PermissionRoute'

const ProcurementPage = lazy(() => import('../../pages/procurement'))
const Suppliers = lazy(() => import('../../pages/suppliers'))
const SupplierDetail = lazy(() => import('../../pages/suppliers/detail'))
const PurchaseRequisitions = lazy(() => import('../../pages/purchase-requisitions'))
const PurchaseOrders = lazy(() => import('../../pages/purchase-orders'))
const GoodsReceipts = lazy(() => import('../../pages/goods-receipts'))
const SupplierInvoices = lazy(() => import('../../pages/supplier-invoices'))
const SupplierPayments = lazy(() => import('../../pages/supplier-payments'))
const SupplierReturns = lazy(() => import('../../pages/supplier-returns'))
const CreditNotes = lazy(() => import('../../pages/credit-notes'))

export const ProcurementRoutes = (
    <Route path={ROUTES.PROCUREMENT} element={<ProcurementPage />}>
        <Route index element={<Navigate to="suppliers" replace />} />
        <Route path="suppliers" element={<PermissionRoute permission="suppliers.view"><Suppliers /></PermissionRoute>} />
        <Route path="suppliers/:supplierId" element={<PermissionRoute permission="suppliers.view"><SupplierDetail /></PermissionRoute>} />
        <Route path="requisitions" element={<PermissionRoute permission="suppliers.orders"><PurchaseRequisitions /></PermissionRoute>} />
        <Route path="purchase-orders" element={<PermissionRoute permission="suppliers.orders"><PurchaseOrders /></PermissionRoute>} />
        <Route path="goods-receipts" element={<PermissionRoute anyOf={['suppliers.orders', 'inventory.receive']}><GoodsReceipts /></PermissionRoute>} />
        <Route path="invoices" element={<PermissionRoute permission="suppliers.orders"><SupplierInvoices /></PermissionRoute>} />
        <Route path="payments" element={<PermissionRoute anyOf={['payments.view', 'payments.process', 'suppliers.orders']}><SupplierPayments /></PermissionRoute>} />
        <Route path="returns" element={<PermissionRoute permission="suppliers.orders"><SupplierReturns /></PermissionRoute>} />
        <Route path="credit-notes" element={<PermissionRoute permission="suppliers.orders"><CreditNotes /></PermissionRoute>} />
    </Route>
)
