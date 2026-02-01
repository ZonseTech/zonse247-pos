import { ROUTES } from '../utils/constants'
import type { FunctionComponent } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import ProtectedLayout from '../layouts/ProtectedLayout'
import MobileTabLayout from '../layouts/MobileTabLayout'
import { lazy, useMemo } from 'react'
import withProtectedRoute from '../navigation/partials/withProtectedRoute'
import InitApp from '../pages/landing/InitApp'
import { useMenuHandler } from '../hooks/useMenuHandler'
import { useIsNativeMobile } from '../hooks/useMediaQuery'

const Users = lazy(() => import('../pages/users/index'))
const PointOfSale = lazy(() => import('../pages/pos'))
const Login = lazy(() => import('../pages/auth/Login'))
const Inventory = lazy(() => import('../pages/inventory'))
const MobileInventory = lazy(() => import('../pages/inventory/MobileStocks'))
const InventoryForm = lazy(() => import('../pages/inventory/create'))
const Categories = lazy(() => import('../pages/categories'))
const Customers = lazy(() => import('../pages/customers'))
const Settings = lazy(() => import('../pages/settings'))
const NotFound = lazy(() => import('../pages/errors/NotFound'))
const SyncData = lazy(() => import('../pages/sync-data'))
const Dashboard = lazy(() => import('../pages/dashboard'))
const LandingPage = lazy(() => import('../pages/landing'))
const BranchManagement = lazy(() => import('../pages/branch'))
const BranchForm = lazy(() => import('../pages/branch/create'));
const TerminalForm = lazy(() => import('../pages/terminal/create'));
const UserForm = lazy(() => import('../pages/users/create'));
const Migrations = lazy(() => import('../pages/migrations'))
const TenantForm = lazy(() => import('../pages/tenants/create'))
const TenantsManagement = lazy(() => import('../pages/tenants'))
const TenantRegistrationDetails = lazy(() => import('../pages/tenant-registration-details'))
const Sales = lazy(() => import('../pages/sales'))
const TodaySales = lazy(() => import('../pages/sales/TodaySales'))
const MobileReceiptDetails = lazy(() => import('../pages/sales/MobileReceiptDetails'))
const MobileReceipt = lazy(() => import('../pages/sales/MobileReceipt'))
const Returns = lazy(() => import('../pages/returns'))
const DatabaseExporter = lazy(() => import('../pages/export-db'))
const AccountDetails = lazy(() => import('../pages/auth/MyProfile'))
const TerminalManagement = lazy(() => import('../pages/terminal'))
const SubscriptionManagement = lazy(() => import('../pages/subscription'))
const RolesAndPermissions = lazy(() => import('../pages/role-permissions'))
const SubscriptionBilling = lazy(() => import('../pages/subscription/SubscriptionBilling'))
const PrinterManagement = lazy(() => import('../pages/printer'))
const PrinterForm = lazy(() => import('../pages/printer/create'))
const PrintJobsManagement = lazy(() => import('../pages/printer/jobs'))

const Products = lazy(() => import('../pages/products'))
const ProductForm = lazy(() => import('../pages/products/create'))
const Suppliers = lazy(() => import('../pages/suppliers'))
const SupplierForm = lazy(() => import('../pages/suppliers/create'))
const PurchaseOrders = lazy(() => import('../pages/purchase-orders'))
const PurchaseOrderForm = lazy(() => import('../pages/purchase-orders/create'))
const StockMovements = lazy(() => import('../pages/stock-movements'))

const ProtectedLayoutWithAuth = withProtectedRoute(ProtectedLayout)

const AppRoutes: FunctionComponent<{ appSettings: SetupData }> = ({ appSettings }) => {
	useMenuHandler()
	const isNativeMobile = useIsNativeMobile()

	const routes = useMemo(() => (
		<Routes>

			<Route path="/" element={<InitApp appSettings={appSettings} />} />
			<Route path={ROUTES.LOGIN} element={<Login />} />
			<Route path={ROUTES.LANDING_PAGE} element={<LandingPage />} />

			<Route path="/" element={<ProtectedLayoutWithAuth />}>
				{isNativeMobile ? (
					<Route element={<MobileTabLayout />}>
						<Route path={ROUTES.POS} element={<PointOfSale />} />
						<Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
						<Route path={ROUTES.TODAY_SALES} element={<TodaySales />} />
						<Route path={ROUTES.ITEMS} element={<MobileInventory />} />
					</Route>
				) : (
					<>
						<Route path={ROUTES.POS} element={<PointOfSale />} />
						<Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
					</>
				)}

				<Route path={ROUTES.RECEIPT_DETAILS} element={<MobileReceiptDetails />} />
				<Route path={ROUTES.RECEIPTS} element={<MobileReceipt />} />
				<Route path={ROUTES.SALES} element={<Sales />} />
				<Route path={ROUTES.INVENTORY} element={<Inventory />} />
				<Route path={ROUTES.USERS} element={<Users />} />
				<Route path={ROUTES.USER_FORM} element={<UserForm />} />
				<Route path={ROUTES.MY_PROFILE} element={<AccountDetails />} />
				<Route path={ROUTES.SETTINGS} element={<Settings />} />
				<Route path={ROUTES.INVENTORY_FORM} element={<InventoryForm />} />
				<Route path={ROUTES.CATEGORIES} element={<Categories />} />
				<Route path={ROUTES.CUSTOMERS} element={<Customers />} />
				<Route path={ROUTES.SYNC_DATA} element={<SyncData />} />
				<Route path={ROUTES.BRANCHES} element={<BranchManagement />} />
				<Route path={ROUTES.BRANCH_FORM} element={<BranchForm />} />
				<Route path={ROUTES.MIGRATIONS} element={<Migrations />} />
				<Route path={ROUTES.TENANTS} element={<TenantsManagement />} />
				<Route path={ROUTES.TENANT_FORM} element={<TenantForm />} />
				<Route path={ROUTES.TENANT_REGISTRATION_DETAILS} element={<TenantRegistrationDetails />} />
				<Route path={ROUTES.RETURNS} element={<Returns />} />
				<Route path={ROUTES.EXPORT_DB} element={<DatabaseExporter />} />
				<Route path={ROUTES.TERMINALS} element={<TerminalManagement />} />
				<Route path={ROUTES.TERMINAL_FORM} element={<TerminalForm />} />
				<Route path={ROUTES.PRINTERS} element={<PrinterManagement />} />
				<Route path={ROUTES.PRINTER_FORM} element={<PrinterForm />} />
				<Route path={ROUTES.PRINT_JOBS} element={<PrintJobsManagement />} />
				<Route path={ROUTES.SUBSCRIPTIONS} element={<SubscriptionManagement />} />
				<Route path={ROUTES.ROLES_PERMISSIONS} element={<RolesAndPermissions />} />
				<Route path={ROUTES.SUBSCRIPTION_BILLING} element={<SubscriptionBilling />} />

				<Route path={ROUTES.PRODUCTS} element={<Products />} />
				<Route path={ROUTES.PRODUCT_FORM} element={<ProductForm />} />
				<Route path={ROUTES.SUPPLIERS} element={<Suppliers />} />
				<Route path={ROUTES.SUPPLIER_FORM} element={<SupplierForm />} />
				<Route path={ROUTES.PURCHASE_ORDERS} element={<PurchaseOrders />} />
				<Route path={ROUTES.PURCHASE_ORDER_FORM} element={<PurchaseOrderForm />} />
				<Route path={ROUTES.STOCK_MOVEMENTS} element={<StockMovements />} />

				<Route path="*" element={<Navigate to="/not-found" />} />
			</Route>

			<Route path="/not-found" element={<NotFound />} />
			<Route path="*" element={<Navigate to="/not-found" replace />} />
		</Routes>
	), [isNativeMobile])

	return routes
}

export default AppRoutes