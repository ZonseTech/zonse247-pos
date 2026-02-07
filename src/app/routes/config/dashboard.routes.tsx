import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Dashboard = lazy(() => import('../../pages/dashboard'))
const MobileReport = lazy(() => import('../../pages/reports/MobileReport'))

export const DashboardRoutes = (
    <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
)

export { MobileReport }
