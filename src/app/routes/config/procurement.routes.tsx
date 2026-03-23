import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const ProcurementPage = lazy(() => import('../../pages/procurement'))
const Suppliers = lazy(() => import('../../pages/suppliers'))
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
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="requisitions" element={<PurchaseRequisitions />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="goods-receipts" element={<GoodsReceipts />} />
        <Route path="invoices" element={<SupplierInvoices />} />
        <Route path="payments" element={<SupplierPayments />} />
        <Route path="returns" element={<SupplierReturns />} />
        <Route path="credit-notes" element={<CreditNotes />} />
    </Route>
)
