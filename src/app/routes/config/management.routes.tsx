import { lazy } from 'react'
import { Route } from 'react-router'
import { ROUTES } from '../../utils/constants'

// Branch Management
const BranchManagement = lazy(() => import('../../pages/branch'))
const BranchForm = lazy(() => import('../../pages/branch/create'))

// Terminal Management
const TerminalManagement = lazy(() => import('../../pages/terminal'))
const TerminalForm = lazy(() => import('../../pages/terminal/create'))

// Tenant Management
const TenantsManagement = lazy(() => import('../../pages/tenants'))
const TenantForm = lazy(() => import('../../pages/tenants/create'))
const TenantRegistrationDetails = lazy(() => import('../../pages/tenant-registration-details'))

// Printer Management
const PrinterManagement = lazy(() => import('../../pages/printer'))
const PrinterForm = lazy(() => import('../../pages/printer/create'))
const PrintJobsManagement = lazy(() => import('../../pages/printer/jobs'))

export const BranchRoutes = (
    <>
        <Route path={ROUTES.BRANCHES} element={<BranchManagement />} />
        <Route path={ROUTES.BRANCH_FORM} element={<BranchForm />} />
    </>
)

export const TerminalRoutes = (
    <>
        <Route path={ROUTES.TERMINALS} element={<TerminalManagement />} />
        <Route path={ROUTES.TERMINAL_FORM} element={<TerminalForm />} />
    </>
)

export const TenantRoutes = (
    <>
        <Route path={ROUTES.TENANTS} element={<TenantsManagement />} />
        <Route path={ROUTES.TENANT_FORM} element={<TenantForm />} />
        <Route path={ROUTES.TENANT_REGISTRATION_DETAILS} element={<TenantRegistrationDetails />} />
    </>
)

export const PrinterRoutes = (
    <>
        <Route path={ROUTES.PRINTERS} element={<PrinterManagement />} />
        <Route path={ROUTES.PRINTER_FORM} element={<PrinterForm />} />
        <Route path={ROUTES.PRINT_JOBS} element={<PrintJobsManagement />} />
    </>
)
