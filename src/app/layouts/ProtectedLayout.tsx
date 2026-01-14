import NavBar from "../navigation/NavBar"
import Footer from "../components/Footer"
import { Outlet, useLocation } from "react-router"
import { type FunctionComponent } from "react"
import { isElectron } from "../../helpers/index.helper"
import { useApp } from "../context/AppProvider"
import { useLayout } from "../context/LayoutContext"
import { useIsMobile } from "../hooks/useMediaQuery"
import { ROUTES } from "../utils/constants"

const ProtectedLayout: FunctionComponent = () => {
	const { settings } = useApp();
	const { isSidebarHidden, toggleSidebar } = useLayout();
	const isMobile = useIsMobile();
	const location = useLocation();
	const isNotDesktopEnv = !isElectron()
	const showWebNav = isNotDesktopEnv || settings?.navigationMenuType === 'web'
	const isPOSActive = location.pathname === ROUTES.POS;

	return (
		<div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
			{showWebNav && !isMobile && !isSidebarHidden && (
				<aside className="hidden md:flex flex-shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 w-64">
					<NavBar
						variant="sidebar"
						isCollapsed={false}
						onToggleCollapse={toggleSidebar}
					/>
				</aside>
			)}

			<div className="flex flex-col flex-1 min-w-0">
				{showWebNav && (
					<header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
						<NavBar
							variant="topbar"
							isSidebarCollapsed={isSidebarHidden}
							onToggleCollapse={toggleSidebar}
						/>
					</header>
				)}

				<main className="flex-grow overflow-hidden pt-2.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
					<div className="h-full overflow-auto">
						<div className="min-h-full px-4">
							<Outlet />
						</div>
					</div>
				</main>
				<div className="border-t border-gray-200 dark:border-gray-700">
					<Footer />
				</div>
			</div>
		</div>
	)
}

export default ProtectedLayout