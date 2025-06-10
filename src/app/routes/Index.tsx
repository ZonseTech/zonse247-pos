import api from '../services/http.service'
import { ROUTES } from '../utils/constants'
import { Navigate, Route, Routes } from 'react-router'
import ProtectedLayout from '../layouts/ProtectedLayout'
import withProtectedRoute from '../navigation/partials/withProtectedRoute'
import { lazy, useEffect, useMemo, useState, type FunctionComponent } from 'react'
import Loader from '../components/Loader'
import PageLoader from '../components/PageLoader'

const Home = lazy(() => import('../pages/pos/Home'))
const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/shop/Register'))
const Products = lazy(() => import('../pages/products/Index'))
const SyncData = lazy(() => import('../pages/sync-data/Index'))
const Dashboard = lazy(() => import('../pages/dashboard/Index'))
const LandingPage = lazy(() => import('../pages/landing/Index'))
const Migrations = lazy(() => import('../pages/migrations/Index'))
const Transactions = lazy(() => import('../pages/transactions/Index'))
const DatabaseExporter = lazy(() => import('../pages/export-db/Index'))

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
			<Route path={ROUTES.GET_STARTED} element={<Register />} />

			<Route path="/" element={<ProtectedLayoutWithAuth />}>
				<Route path={ROUTES.POS} element={<Home />} />
				<Route path={ROUTES.PRODUCTS} element={<Products />} />
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