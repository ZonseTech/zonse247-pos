import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Services = lazy(() => import('../../pages/services'))
const ServiceForm = lazy(() => import('../../pages/services/create'))

export const ServiceRoutes = (
    <>
        <Route path={ROUTES.SERVICES} element={<Services />} />
        <Route path={ROUTES.SERVICE_FORM} element={<ServiceForm />} />
    </>
)
