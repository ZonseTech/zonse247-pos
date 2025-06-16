import api from '../services/http.service'
import { ROUTES } from '../utils/constants'
import type { FunctionComponent } from 'react'
import PageLoader from '../components/PageLoader'
import { Navigate, Route, Routes } from 'react-router'
import ProtectedLayout from '../layouts/ProtectedLayout'
import { lazy, useEffect, useMemo, useState } from 'react'
import withProtectedRoute from '../navigation/partials/withProtectedRoute'

const Users = lazy(() => import('../pages/users'))
const Home = lazy(() => import('../pages/pos/Home'))
const Login = lazy(() => import('../pages/auth/Login'))
const Products = lazy(() => import('../pages/products'))
const SyncData = lazy(() => import('../pages/sync-data'))
const Dashboard = lazy(() => import('../pages/dashboard'))
const LandingPage = lazy(() => import('../pages/landing'))
const Migrations = lazy(() => import('../pages/migrations'))
const Transactions = lazy(() => import('../pages/transactions'))
const DatabaseExporter = lazy(() => import('../pages/export-db'))
const ActivateWorkStation = lazy(() => import('../pages/shop/ActivateWorkStation'))
const SubscriptionManagement = lazy(() => import('../pages/subscription'))
const ClientManagement = lazy(() => import('../pages/clients'))
const ShopManagement = lazy(() => import('../pages/shop'))
const WorkStationManagement = lazy(() => import('../pages/workstation'))

const ProtectedLayoutWithAuth = withProtectedRoute(ProtectedLayout)

const AppRoutes: FunctionComponent = () => {
	const [isAccountVerified, setIsStationVerified] = useState(false)
	const [isLoadingVerification, setIsLoadingVerification] = useState(true)

	useEffect(() => {
		const checkStationDetails = async () => {
			try {
				setIsLoadingVerification(true);

				const response = await api.post('/shop/check-pos-details', {})

				const shopData = sessionStorage.getItem('station')

				if (!shopData) {
					setIsStationVerified(false)
					return
				}

				if (response.data && response.status === 200) {
					setIsStationVerified(true)
				} else {
					setIsStationVerified(false)
				}

			} catch (error) {
				console.error('Shop station details not found:', error)
				setIsStationVerified(false)
			} finally {
				setIsLoadingVerification(false)
			}
		}

		checkStationDetails()
	}, [])

	if (isAccountVerified) return <PageLoader />

	const routes = useMemo(() => (
		<Routes>

			<Route
				path="/"
				element={
					isAccountVerified ?
						<Login /> :
						<LandingPage />
				}
			/>

			<Route path={ROUTES.LOGIN} element={<Login />} />
			<Route path={ROUTES.GET_STARTED} element={<ActivateWorkStation />} />

			<Route path="/" element={<ProtectedLayoutWithAuth />}>
				<Route path={ROUTES.POS} element={<Home />} />
				<Route path={ROUTES.USERS} element={<Users />} />
				<Route path={ROUTES.PRODUCTS} element={<Products />} />
				<Route path={ROUTES.WORK_STATIONS} element={<WorkStationManagement />} />
				<Route path={ROUTES.SUBSCRIPTION} element={<SubscriptionManagement />} />
				<Route path={ROUTES.CLIENTS} element={<ClientManagement />} />
				<Route path={ROUTES.SHOPS} element={<ShopManagement />} />
				<Route path={ROUTES.SYNC_DATA} element={<SyncData />} />
				<Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
				<Route path={ROUTES.MIGRATIONS} element={<Migrations />} />
				<Route path={ROUTES.TRANSACTIONS} element={<Transactions />} />
				<Route path={ROUTES.EXPORT_DB} element={<DatabaseExporter />} />

				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	), [])

	return routes
}

export default AppRoutes