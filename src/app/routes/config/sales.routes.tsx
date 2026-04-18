import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { ROUTES } from '../../utils/constants'
import useBusinessFeatures from '../../hooks/useBusinessFeatures'

const SalesHubPage = lazy(() => import('../../pages/sales-hub'))
const Sales = lazy(() => import('../../pages/sales'))
const SaleDetailsPage = lazy(() => import('../../pages/sales/SaleDetailsPage'))
const TodaySales = lazy(() => import('../../pages/sales/TodaySales'))
const Returns = lazy(() => import('../../pages/returns'))
const DesktopReports = lazy(() => import('../../pages/reports/DesktopReports'))
const ServiceOrders = lazy(() => import('../../pages/service-orders'))

function SalesHubIndex() {
    const { showServices } = useBusinessFeatures();
    return <Navigate to={showServices ? 'service-orders' : 'sales'} replace />;
}

export const SalesRoutes = (
    <>
        <Route path={ROUTES.SALES_HUB} element={<SalesHubPage />}>
            <Route index element={<SalesHubIndex />} />
            <Route path="sales" element={<Sales />} />
            <Route path="service-orders" element={<ServiceOrders />} />
            <Route path="reports" element={<DesktopReports />} />
            <Route path="returns" element={<Returns />} />
        </Route>
        <Route path={ROUTES.SALES} element={<Sales />} />
        <Route path={ROUTES.SALE_DETAILS} element={<SaleDetailsPage />} />
        <Route path={ROUTES.RETURNS} element={<Returns />} />
    </>
)

export { TodaySales }
