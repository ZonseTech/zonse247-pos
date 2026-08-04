import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'
import MobileTabLayout from '../../layouts/MobileTabLayout'
import PermissionRoute from '../../navigation/PermissionRoute'

const PointOfSale = lazy(() => import('../../pages/pos'))
const MobileReport = lazy(() => import('../../pages/reports/MobileReports'))
const TodaySales = lazy(() => import('../../pages/sales/TodaySales'))
const MobileStocks = lazy(() => import('../../pages/inventory/MobileStocks'))
const MobileMoreReportsPage = lazy(() => import('../../pages/reports/MobileMoreReportsPage'))
const ServiceOrders = lazy(() => import('../../pages/service-orders'))
const TodayServiceOrders = lazy(() => import('../../pages/service-orders/TodayServiceOrders'))

export const MobileTabRoutes = (
    <Route element={<MobileTabLayout />}>
        <Route path={ROUTES.POS} element={<PermissionRoute anyOf={['sales.create', 'sales.view', 'sales.view.own']}><PointOfSale /></PermissionRoute>} />
        <Route path={ROUTES.MOBILE_REPORT} element={<MobileReport />} />
        <Route path={ROUTES.TODAY_SALES} element={<PermissionRoute anyOf={['sales.view', 'sales.view.own']}><TodaySales /></PermissionRoute>} />
        <Route path={ROUTES.ITEMS} element={<MobileStocks />} />
        <Route path={ROUTES.MOBILE_MORE} element={<PermissionRoute anyOf={['analytics.view', 'reports.inventory', 'reports.staff', 'reports.customers']}><MobileMoreReportsPage /></PermissionRoute>} />
        <Route path={ROUTES.TODAY_SERVICE_ORDERS} element={<TodayServiceOrders />} />
        <Route path={ROUTES.SERVICE_ORDERS} element={<ServiceOrders />} />
    </Route>
)

export const DesktopPosRoute = (
    <Route path={ROUTES.POS} element={<PermissionRoute anyOf={['sales.create', 'sales.view', 'sales.view.own']}><PointOfSale /></PermissionRoute>} />
)
