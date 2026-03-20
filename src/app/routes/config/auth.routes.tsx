import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const Login = lazy(() => import('../../pages/auth/Login'))
const LandingPage = lazy(() => import('../../pages/landing'))
const AccountDetails = lazy(() => import('../../pages/auth/MyProfile'))
const ForceChangePassword = lazy(() => import('../../pages/auth/ForceChangePassword'))

export const PublicAuthRoutes = (
    <>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.LANDING_PAGE} element={<LandingPage />} />
    </>
)

export const ProtectedAuthRoutes = (
    <>
        <Route path={ROUTES.MY_PROFILE} element={<AccountDetails />} />
        <Route path={ROUTES.CHANGE_PASSWORD} element={<ForceChangePassword />} />
    </>
)
