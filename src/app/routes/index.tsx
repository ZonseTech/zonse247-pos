import { ROUTES } from '../utils/constants'
import type { FunctionComponent } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import ProtectedLayout from '../layouts/ProtectedLayout'
import { lazy, useMemo } from 'react'
import withProtectedRoute from '../navigation/partials/withProtectedRoute'
import InitApp from '../pages/landing/InitApp'

const Users = lazy(() => import('../pages/users'))
const PointOfSale = lazy(() => import('../pages/pos'))
const Login = lazy(() => import('../pages/auth/Login'))
const Products = lazy(() => import('../pages/products'))
const SyncData = lazy(() => import('../pages/sync-data'))
const Dashboard = lazy(() => import('../pages/dashboard'))
const LandingPage = lazy(() => import('../pages/landing'))
const ShopManagement = lazy(() => import('../pages/shop'))
const Migrations = lazy(() => import('../pages/migrations'))
const ClientManagement = lazy(() => import('../pages/clients'))
const Transactions = lazy(() => import('../pages/transactions'))
const DatabaseExporter = lazy(() => import('../pages/export-db'))
const ClientVerification = lazy(() => import('../pages/on-boarding'))
const WorkStationManagement = lazy(() => import('../pages/workstation'))
const RolesAndPermissions = lazy(() => import('../pages/role-permissions'))
const SubscriptionManagement = lazy(() => import('../pages/subscription'))

const ProtectedLayoutWithAuth = withProtectedRoute(ProtectedLayout)

const AppRoutes: FunctionComponent = () => {
	const routes = useMemo(() => (
		<Routes>

			<Route path="/" element={<InitApp />} />
			<Route path={ROUTES.LOGIN} element={<Login />} />
			<Route path={ROUTES.LANDING_PAGE} element={<LandingPage />} />
			<Route path={ROUTES.GET_STARTED} element={<ClientVerification />} />

			<Route path="/" element={<ProtectedLayoutWithAuth />}>
				<Route path={ROUTES.POS} element={<PointOfSale />} />
				<Route path={ROUTES.USERS} element={<Users />} />
				<Route path={ROUTES.PRODUCTS} element={<Products />} />
				<Route path={ROUTES.SYNC_DATA} element={<SyncData />} />
				<Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
				<Route path={ROUTES.SHOPS} element={<ShopManagement />} />
				<Route path={ROUTES.MIGRATIONS} element={<Migrations />} />
				<Route path={ROUTES.CLIENTS} element={<ClientManagement />} />
				<Route path={ROUTES.TRANSACTIONS} element={<Transactions />} />
				<Route path={ROUTES.EXPORT_DB} element={<DatabaseExporter />} />
				<Route path={ROUTES.WORK_STATIONS} element={<WorkStationManagement />} />
				<Route path={ROUTES.SUBSCRIPTION} element={<SubscriptionManagement />} />
				<Route path={ROUTES.ROLES_PERMISSIONS} element={<RolesAndPermissions />} />

				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	), [])

	return routes
}

export default AppRoutes