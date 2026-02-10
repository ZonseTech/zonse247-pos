import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const SubscriptionManagement = lazy(() => import('../../pages/subscription'))
const SubscriptionBilling = lazy(() => import('../../pages/subscription/SubscriptionBilling'))

export const SubscriptionRoutes = (
    <>
        <Route path={ROUTES.SUBSCRIPTIONS} element={<SubscriptionManagement />} />
        <Route path={ROUTES.SUBSCRIPTION_BILLING} element={<SubscriptionBilling />} />
    </>
)
