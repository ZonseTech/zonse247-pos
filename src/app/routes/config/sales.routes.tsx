import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'
import PermissionRoute from '../../navigation/PermissionRoute'

const Sales = lazy(() => import('../../pages/sales'))
const SaleDetailsPage = lazy(() => import('../../pages/sales/SaleDetailsPage'))
const DayEndCloseForm = lazy(() => import('../../pages/sales/DayEndCloseForm'))
const DayCloseDetailsPage = lazy(() => import('../../pages/sales/DayCloseDetailsPage'))
const TodaySales = lazy(() => import('../../pages/sales/TodaySales'))
const Returns = lazy(() => import('../../pages/returns'))

export const SalesRoutes = (
    <>
        <Route path={ROUTES.SALES} element={<PermissionRoute anyOf={['sales.view', 'sales.view.own']}><Sales /></PermissionRoute>} />
        <Route path={ROUTES.DAY_END_CLOSE_FORM} element={<PermissionRoute permission="sales.create"><DayEndCloseForm /></PermissionRoute>} />
        <Route path={ROUTES.DAY_CLOSE_REPORT_DETAILS} element={<PermissionRoute anyOf={['sales.view', 'sales.view.own']}><DayCloseDetailsPage /></PermissionRoute>} />
        <Route path={ROUTES.SALE_DETAILS} element={<PermissionRoute anyOf={['sales.view', 'sales.view.own']}><SaleDetailsPage /></PermissionRoute>} />
        <Route path={ROUTES.RETURNS} element={<PermissionRoute anyOf={['refunds.view', 'refunds.process', 'refunds.approve']}><Returns /></PermissionRoute>} />
    </>
)

export { TodaySales }
