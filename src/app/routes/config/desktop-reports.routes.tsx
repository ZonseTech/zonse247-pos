import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const DesktopReports = lazy(() => import('../../pages/reports'))

export const DesktopReportRoutes = (
    <Route path={ROUTES.REPORTS} element={<DesktopReports />} />
)
