import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'
import PermissionRoute from '../../navigation/PermissionRoute'

const BranchManagement = lazy(() => import('../../pages/branch'))
const BranchForm = lazy(() => import('../../pages/branch/create'))
const TerminalManagement = lazy(() => import('../../pages/terminal'))
const TerminalForm = lazy(() => import('../../pages/terminal/create'))
const TenantsManagement = lazy(() => import('../../pages/tenants'))
const TenantForm = lazy(() => import('../../pages/tenants/create'))
const TenantDetails = lazy(() => import('../../pages/tenants/details'))
const PrinterManagement = lazy(() => import('../../pages/printer'))
const PrintJobsManagement = lazy(() => import('../../pages/printer/jobs'))

export const BranchRoutes = (
    <>
        <Route path={ROUTES.BRANCHES} element={<PermissionRoute permission="branches.view"><BranchManagement /></PermissionRoute>} />
        <Route path={ROUTES.BRANCH_FORM} element={<PermissionRoute permission="branches.view"><BranchForm /></PermissionRoute>} />
    </>
)

export const TerminalRoutes = (
    <>
        <Route path={ROUTES.TERMINALS} element={<PermissionRoute permission="terminals.view"><TerminalManagement /></PermissionRoute>} />
        <Route path={ROUTES.TERMINAL_FORM} element={<PermissionRoute permission="terminals.view"><TerminalForm /></PermissionRoute>} />
    </>
)

export const TenantRoutes = (
    <>
        <Route path={ROUTES.TENANTS} element={<PermissionRoute permission="system.admin"><TenantsManagement /></PermissionRoute>} />
        <Route path={ROUTES.TENANT_DETAILS} element={<PermissionRoute permission="system.admin"><TenantDetails /></PermissionRoute>} />
        <Route path={ROUTES.TENANT_FORM} element={<PermissionRoute permission="system.admin"><TenantForm /></PermissionRoute>} />
    </>
)

export const PrinterRoutes = (
    <>
        <Route path={ROUTES.PRINTERS} element={<PrinterManagement />} />
        <Route path={ROUTES.PRINT_JOBS} element={<PrintJobsManagement />} />
    </>
)
