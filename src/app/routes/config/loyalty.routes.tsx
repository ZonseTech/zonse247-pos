import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const LoyaltyProgram = lazy(() => import('../../pages/loyalty-program'))

export const LoyaltyRoutes = (
    <>
        <Route path={ROUTES.LOYALTY_PROGRAM} element={<LoyaltyProgram />} />
    </>
)
