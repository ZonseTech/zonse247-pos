import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'
import MobileTabLayout from '../../layouts/MobileTabLayout'

const PointOfSale = lazy(() => import('../../pages/pos'))
const MobileReport = lazy(() => import('../../pages/dashboard/MobileReport'))
const TodaySales = lazy(() => import('../../pages/sales/TodaySales'))
const MobileStocks = lazy(() => import('../../pages/inventory/MobileStocks'))

export const MobileTabRoutes = (
    <Route element={<MobileTabLayout />}>
        <Route path={ROUTES.POS} element={<PointOfSale />} />
        <Route path={ROUTES.MOBILE_REPORT} element={<MobileReport />} />
        <Route path={ROUTES.TODAY_SALES} element={<TodaySales />} />
        <Route path={ROUTES.ITEMS} element={<MobileStocks />} />
    </Route>
)

export const DesktopPosRoute = (
    <Route path={ROUTES.POS} element={<PointOfSale />} />
)
