import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const ProcurementPage = lazy(() => import('../../pages/procurement'))

export const ProcurementRoutes = (
    <Route path={ROUTES.PROCUREMENT} element={<ProcurementPage />} />
)
