import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'
import PermissionRoute from '../../navigation/PermissionRoute'

const BranchForm = lazy(() => import('../../pages/branch/create'))
const TerminalForm = lazy(() => import('../../pages/terminal/create'))
const TenantsManagement = lazy(() => import('../../pages/tenants'))
const TenantDetails = lazy(() => import('../../pages/tenants/details'))
const PrinterManagement = lazy(() => import('../../pages/printer'))
const PrintJobsManagement = lazy(() => import('../../pages/printer/jobs'))

export const BranchRoutes = (
    <>
        <Route path={ROUTES.BRANCH_FORM} element={<PermissionRoute permission="branches.view"><BranchForm /></PermissionRoute>} />
    </>
)

export const TerminalRoutes = (
    <>
        <Route path={ROUTES.TERMINAL_FORM} element={<PermissionRoute permission="terminals.view"><TerminalForm /></PermissionRoute>} />
    </>
)

export const TenantRoutes = (
    <>
        <Route path={ROUTES.TENANTS} element={<PermissionRoute permission="tenants.view"><TenantsManagement /></PermissionRoute>} />
        <Route path={ROUTES.TENANT_DETAILS} element={<PermissionRoute permission="tenants.view"><TenantDetails /></PermissionRoute>} />
    </>
)

export const PrinterRoutes = (
    <>
        <Route path={ROUTES.PRINTERS} element={<PrinterManagement />} />
        <Route path={ROUTES.PRINT_JOBS} element={<PrintJobsManagement />} />
    </>
)
