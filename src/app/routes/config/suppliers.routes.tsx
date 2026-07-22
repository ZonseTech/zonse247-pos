import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Suppliers = lazy(() => import('../../pages/suppliers'))
const SupplierForm = lazy(() => import('../../pages/suppliers/create'))
const SupplierDetail = lazy(() => import('../../pages/suppliers/detail'))
const PurchaseOrders = lazy(() => import('../../pages/purchase-orders'))
const PurchaseOrderForm = lazy(() => import('../../pages/purchase-orders/create'))
const PurchaseRequisitions = lazy(() => import('../../pages/purchase-requisitions'))
const PurchaseRequisitionForm = lazy(() => import('../../pages/purchase-requisitions/create'))
const GoodsReceipts = lazy(() => import('../../pages/goods-receipts'))
const GoodsReceiptForm = lazy(() => import('../../pages/goods-receipts/create'))
const SupplierInvoices = lazy(() => import('../../pages/supplier-invoices'))
const SupplierInvoiceForm = lazy(() => import('../../pages/supplier-invoices/create'))
const SupplierPayments = lazy(() => import('../../pages/supplier-payments'))
const SupplierPaymentForm = lazy(() => import('../../pages/supplier-payments/create'))
const SupplierReturns = lazy(() => import('../../pages/supplier-returns'))
const SupplierReturnForm = lazy(() => import('../../pages/supplier-returns/create'))
const CreditNotes = lazy(() => import('../../pages/credit-notes'))

export const SupplierRoutes = (
    <>
        <Route path={ROUTES.SUPPLIERS} element={<Suppliers />} />
        <Route path={ROUTES.SUPPLIER_FORM} element={<SupplierForm />} />
        <Route path={ROUTES.SUPPLIER_DETAILS} element={<SupplierDetail />} />
        <Route path={ROUTES.PURCHASE_ORDERS} element={<PurchaseOrders />} />
        <Route path={ROUTES.PURCHASE_ORDER_FORM} element={<PurchaseOrderForm />} />
        <Route path={ROUTES.PURCHASE_REQUISITIONS} element={<PurchaseRequisitions />} />
        <Route path={ROUTES.PURCHASE_REQUISITION_FORM} element={<PurchaseRequisitionForm />} />
        <Route path={ROUTES.GOODS_RECEIPTS} element={<GoodsReceipts />} />
        <Route path={ROUTES.GOODS_RECEIPT_FORM} element={<GoodsReceiptForm />} />
        <Route path={ROUTES.SUPPLIER_INVOICES} element={<SupplierInvoices />} />
        <Route path={ROUTES.SUPPLIER_INVOICE_FORM} element={<SupplierInvoiceForm />} />
        <Route path={ROUTES.SUPPLIER_PAYMENTS} element={<SupplierPayments />} />
        <Route path={ROUTES.SUPPLIER_PAYMENT_FORM} element={<SupplierPaymentForm />} />
        <Route path={ROUTES.SUPPLIER_RETURNS} element={<SupplierReturns />} />
        <Route path={ROUTES.SUPPLIER_RETURN_FORM} element={<SupplierReturnForm />} />
        <Route path={ROUTES.CREDIT_NOTES} element={<CreditNotes />} />
    </>
)
