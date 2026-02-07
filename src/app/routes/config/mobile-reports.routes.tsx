import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const TotalSalesReport = lazy(() => import('../../pages/reports/TotalSalesReport'))
const GrossProfitReport = lazy(() => import('../../pages/reports/GrossProfitReport'))
const TopStocksReport = lazy(() => import('../../pages/reports/TopStocksReport'))
const TopCategoryReport = lazy(() => import('../../pages/reports/TopCategoryReport'))
const ReceiptCountReport = lazy(() => import('../../pages/reports/ReceiptCountReport'))
const PaymentModesReport = lazy(() => import('../../pages/reports/PaymentModesReport'))

export const MobileReportRoutes = (
    <>
        <Route path={ROUTES.MOBILE_REPORT_TOTAL_SALES} element={<TotalSalesReport />} />
        <Route path={ROUTES.MOBILE_REPORT_GROSS_PROFIT} element={<GrossProfitReport />} />
        <Route path={ROUTES.MOBILE_REPORT_TOP_STOCKS} element={<TopStocksReport />} />
        <Route path={ROUTES.MOBILE_REPORT_TOP_CATEGORY} element={<TopCategoryReport />} />
        <Route path={ROUTES.MOBILE_REPORT_RECEIPT_COUNT} element={<ReceiptCountReport />} />
        <Route path={ROUTES.MOBILE_REPORT_PAYMENT_MODES} element={<PaymentModesReport />} />
    </>
)
