import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const SalesHubPage = lazy(() => import('../../pages/sales-hub'))
const Sales = lazy(() => import('../../pages/sales'))
const SaleDetailsPage = lazy(() => import('../../pages/sales/SaleDetailsPage'))
const TodaySales = lazy(() => import('../../pages/sales/TodaySales'))
const Returns = lazy(() => import('../../pages/returns'))
const DesktopReports = lazy(() => import('../../pages/reports/DesktopReports'))

export const SalesRoutes = (
    <>
        <Route path={ROUTES.SALES_HUB} element={<SalesHubPage />}>
            <Route index element={<Navigate to="sales" replace />} />
            <Route path="sales" element={<Sales />} />
            <Route path="reports" element={<DesktopReports />} />
            <Route path="returns" element={<Returns />} />
        </Route>
        <Route path={ROUTES.SALES} element={<Sales />} />
        <Route path={ROUTES.SALE_DETAILS} element={<SaleDetailsPage />} />
        <Route path={ROUTES.RETURNS} element={<Returns />} />
    </>
)

export { TodaySales }
