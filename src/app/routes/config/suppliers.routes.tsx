import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Suppliers = lazy(() => import('../../pages/suppliers'))
const SupplierDetail = lazy(() => import('../../pages/suppliers/detail'))
const PurchaseOrders = lazy(() => import('../../pages/purchase-orders'))
const PurchaseOrderForm = lazy(() => import('../../pages/purchase-orders/create'))
const PurchaseRequisitions = lazy(() => import('../../pages/purchase-requisitions'))
const GoodsReceipts = lazy(() => import('../../pages/goods-receipts'))
const SupplierInvoices = lazy(() => import('../../pages/supplier-invoices'))
const SupplierPayments = lazy(() => import('../../pages/supplier-payments'))
const SupplierReturns = lazy(() => import('../../pages/supplier-returns'))
const CreditNotes = lazy(() => import('../../pages/credit-notes'))

export const SupplierRoutes = (
    <>
        <Route path={ROUTES.SUPPLIERS} element={<Suppliers />} />
        <Route path={ROUTES.SUPPLIER_DETAILS} element={<SupplierDetail />} />
        <Route path={ROUTES.PURCHASE_ORDERS} element={<PurchaseOrders />} />
        <Route path={ROUTES.PURCHASE_ORDER_FORM} element={<PurchaseOrderForm />} />
        <Route path={ROUTES.PURCHASE_REQUISITIONS} element={<PurchaseRequisitions />} />
        <Route path={ROUTES.GOODS_RECEIPTS} element={<GoodsReceipts />} />
        <Route path={ROUTES.SUPPLIER_INVOICES} element={<SupplierInvoices />} />
        <Route path={ROUTES.SUPPLIER_PAYMENTS} element={<SupplierPayments />} />
        <Route path={ROUTES.SUPPLIER_RETURNS} element={<SupplierReturns />} />
        <Route path={ROUTES.CREDIT_NOTES} element={<CreditNotes />} />
    </>
)
