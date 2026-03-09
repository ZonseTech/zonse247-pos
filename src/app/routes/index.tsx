import { useMemo } from 'react'
import type { FunctionComponent } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { useMenuHandler } from '../hooks/useMenuHandler'
import { useIsNativeMobile } from '../hooks/useMediaQuery'
import withProtectedRoute from '../navigation/partials/withProtectedRoute'
import ProtectedLayout from '../layouts/ProtectedLayout'
import InitApp from '../pages/landing/InitApp'
import {
	PublicAuthRoutes,
	ProtectedAuthRoutes,
	DashboardRoutes,
	MobileTabRoutes,
	DesktopPosRoute,
	MobileReportRoutes,
	DesktopReportRoutes,
	SalesRoutes,
	InventoryRoutes,
	SupplierRoutes,
	UserRoutes,
	BranchRoutes,
	TerminalRoutes,
	TenantRoutes,
	PrinterRoutes,
	SubscriptionRoutes,
	SystemRoutes,
	ErrorRoutes,
} from './config'

const ProtectedLayoutWithAuth = withProtectedRoute(ProtectedLayout)

const AppRoutes: FunctionComponent<{ appSettings: SetupData }> = ({ appSettings }) => {
	useMenuHandler()
	const isNativeMobile = useIsNativeMobile()

	const routes = useMemo(
		() => (
			<Routes>
				<Route path="/" element={<InitApp appSettings={appSettings} />} />
				{PublicAuthRoutes}

				<Route path="/" element={<ProtectedLayoutWithAuth />}>
					{isNativeMobile ? MobileTabRoutes : DesktopPosRoute}

					{DashboardRoutes}
					{MobileReportRoutes}
					{DesktopReportRoutes}
					{SalesRoutes}
					{InventoryRoutes}
					{SupplierRoutes}

					{UserRoutes}
					{ProtectedAuthRoutes}

					{BranchRoutes}
					{TerminalRoutes}
					{TenantRoutes}
					{PrinterRoutes}
					{SubscriptionRoutes}

					{SystemRoutes}

					<Route path="*" element={<Navigate to="/not-found" />} />
				</Route>

				{ErrorRoutes}
				<Route path="*" element={<Navigate to="/not-found" replace />} />
			</Routes>
		),
		[isNativeMobile]
	)

	return routes
}

export default AppRoutes