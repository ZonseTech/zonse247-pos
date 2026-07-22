import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Sales = lazy(() => import('../../pages/sales'))
const SaleDetailsPage = lazy(() => import('../../pages/sales/SaleDetailsPage'))
const TodaySales = lazy(() => import('../../pages/sales/TodaySales'))
const Returns = lazy(() => import('../../pages/returns'))

export const SalesRoutes = (
    <>
        <Route path={ROUTES.SALES} element={<Sales />} />
        <Route path={ROUTES.SALE_DETAILS} element={<SaleDetailsPage />} />
        <Route path={ROUTES.RETURNS} element={<Returns />} />
    </>
)

export { TodaySales }
