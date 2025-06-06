import { Route, Routes } from 'react-router'
import { ROUTES } from '../utils/constants'
import ProtectedLayout from '../layouts/ProtectedLayout'
import { lazy, useMemo, type FunctionComponent } from 'react'
import withProtectedRoute from '../navigation/partials/withProtectedRoute'

const Home = lazy(() => import('../pages/pos/Home'))
const Login = lazy(() => import('../pages/auth/Login'))
const Products = lazy(() => import('../pages/products/Index'))
const SyncData = lazy(() => import('../pages/sync-data/Index'))
const Dashboard = lazy(() => import('../pages/dashboard/Index'))
const LandingPage = lazy(() => import('../pages/landing/Index'))
const Migrations = lazy(() => import('../pages/migrations/Index'))
const Transactions = lazy(() => import('../pages/transactions/Index'))
const DatabaseExporter = lazy(() => import('../pages/export-db/Index'))

const ProtectedLayoutWithAuth = withProtectedRoute(ProtectedLayout)

const AppRoutes: FunctionComponent = () => {
	const routes = useMemo(() => (
		<Routes>
			<Route index path="/" element={<LandingPage />} />
			<Route path={ROUTES.LOGIN} element={<Login />} />

			<Route path="/" element={<ProtectedLayoutWithAuth />}>
				<Route path={ROUTES.POS} element={<Home />} />
				<Route path={ROUTES.PRODUCTS} element={<Products />} />
				<Route path={ROUTES.SYNC_DATA} element={<SyncData />} />
				<Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
				<Route path={ROUTES.MIGRATIONS} element={<Migrations />} />
				<Route path={ROUTES.TRANSACTIONS} element={<Transactions />} />
				<Route path={ROUTES.EXPORT_DB} element={<DatabaseExporter />} />
			</Route>
		</Routes>
	), [])

	return routes
}

export default AppRoutes