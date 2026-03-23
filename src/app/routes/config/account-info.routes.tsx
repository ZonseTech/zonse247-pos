import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

const AccountInfoPage = lazy(() => import('../../pages/account-info'))
const TenantPage = lazy(() => import('../../pages/account-info/pages/TenantPage'))
const BranchesPage = lazy(() => import('../../pages/account-info/pages/BranchesPage'))
const TerminalsPage = lazy(() => import('../../pages/account-info/pages/TerminalsPage'))

export const AccountInfoRoutes = (
    <Route path={ROUTES.ACCOUNT_INFO} element={<AccountInfoPage />}>
        <Route index element={<Navigate to="tenant" replace />} />
        <Route path="tenant" element={<TenantPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="terminals" element={<TerminalsPage />} />
    </Route>
)
