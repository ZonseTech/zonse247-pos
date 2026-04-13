import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const ServiceOrders = lazy(() => import('../../pages/service-orders'))
const ServiceOrderDetail = lazy(() => import('../../pages/service-orders/detail'))
const ServiceOrderCreate = lazy(() => import('../../pages/service-orders/create'))

export const ServiceOrderRoutes = (
    <>
        <Route path={ROUTES.SERVICE_ORDERS} element={<ServiceOrders />} />
        <Route path={ROUTES.SERVICE_ORDER_CREATE} element={<ServiceOrderCreate />} />
        <Route path={ROUTES.SERVICE_ORDER_DETAILS} element={<ServiceOrderDetail />} />
    </>
)
