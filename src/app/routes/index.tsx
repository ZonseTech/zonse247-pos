import { ROUTES } from '../utils/constants'
import type { FunctionComponent } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import ProtectedLayout from '../layouts/ProtectedLayout'
import { lazy, useMemo } from 'react'
import withProtectedRoute from '../navigation/partials/withProtectedRoute'
import InitApp from '../pages/landing/InitApp'
import { useMenuHandler } from '../hooks/useMenuHandler'
import { useModalManager } from '../hooks/useModalManager'

const Users = lazy(() => import('../pages/users'))
const PointOfSale = lazy(() => import('../pages/pos'))
const Login = lazy(() => import('../pages/auth/Login'))
const Products = lazy(() => import('../pages/products'))
const Categories = lazy(() => import('../pages/categories'))
const Settings = lazy(() => import('../pages/app-settings'))
const NotFound = lazy(() => import('../pages/errors/NotFound'))
const SyncData = lazy(() => import('../pages/sync-data'))
const Dashboard = lazy(() => import('../pages/dashboard'))
const LandingPage = lazy(() => import('../pages/landing'))
const BranchManagement = lazy(() => import('../pages/branch'))
const BranchForm = lazy(() => import('../pages/branch/create'));
const TerminalForm = lazy(() => import('../pages/terminal/create'));
const Migrations = lazy(() => import('../pages/migrations'))
const TenantForm = lazy(() => import('../pages/tenants/create'))
const TenantsManagement = lazy(() => import('../pages/tenants'))
const Transactions = lazy(() => import('../pages/transactions'))
const DatabaseExporter = lazy(() => import('../pages/export-db'))
const AccountDetails = lazy(() => import('../pages/auth/MyProfile'))
const TerminalManagement = lazy(() => import('../pages/terminal'))
const SubscriptionManagement = lazy(() => import('../pages/subscription'))
const RolesAndPermissions = lazy(() => import('../pages/role-permissions'))
const SubscriptionBilling = lazy(() => import('../pages/subscription/SubscriptionBilling'))

const ProtectedLayoutWithAuth = withProtectedRoute(ProtectedLayout)

const AppRoutes: FunctionComponent<{ appSettings: SetupData }> = ({ appSettings }) => {
	useMenuHandler()
	useModalManager()

	const routes = useMemo(() => (
		<Routes>

			<Route path="/" element={<InitApp appSettings={appSettings} />} />
			<Route path={ROUTES.LOGIN} element={<Login />} />
			<Route path={ROUTES.LANDING_PAGE} element={<LandingPage />} />

			<Route path="/" element={<ProtectedLayoutWithAuth />}>
				<Route path={ROUTES.POS} element={<PointOfSale />} />
				<Route path={ROUTES.USERS} element={<Users />} />
				<Route path={ROUTES.MY_PROFILE} element={<AccountDetails />} />
				<Route path={ROUTES.SETTINGS} element={<Settings />} />
				<Route path={ROUTES.PRODUCTS} element={<Products />} />
				<Route path={ROUTES.CATEGORIES} element={<Categories />} />
				<Route path={ROUTES.SYNC_DATA} element={<SyncData />} />
				<Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
				<Route path={ROUTES.BRANCHES} element={<BranchManagement />} />
				<Route path={ROUTES.BRANCH_FORM} element={<BranchForm />} />
				<Route path={ROUTES.MIGRATIONS} element={<Migrations />} />
				<Route path={ROUTES.TENANTS} element={<TenantsManagement />} />
				<Route path={ROUTES.TENANT_FORM} element={<TenantForm />} />
				<Route path={ROUTES.TRANSACTIONS} element={<Transactions />} />
				<Route path={ROUTES.EXPORT_DB} element={<DatabaseExporter />} />
				<Route path={ROUTES.TERMINALS} element={<TerminalManagement />} />
				<Route path={ROUTES.TERMINAL_FORM} element={<TerminalForm />} />
				<Route path={ROUTES.SUBSCRIPTIONS} element={<SubscriptionManagement />} />
				<Route path={ROUTES.ROLES_PERMISSIONS} element={<RolesAndPermissions />} />
				<Route path={ROUTES.SUBSCRIPTION_BILLING} element={<SubscriptionBilling />} />

				<Route path="*" element={<Navigate to="/not-found" />} />
			</Route>

			<Route path="/not-found" element={<NotFound />} />
			<Route path="*" element={<Navigate to="/not-found" replace />} />
		</Routes>
	), [])

	return routes
}

export default AppRoutes