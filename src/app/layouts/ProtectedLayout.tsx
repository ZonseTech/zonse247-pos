import NavBar from "../navigation/NavBar"
import Footer from "../components/Footer"
import { Outlet } from "react-router"
import { type FunctionComponent } from "react"
import { isElectron } from "../../helpers/index.helper"
import { useApp } from "../context/AppProvider"
import { useIsMobile, useIsNativeMobile, useIsEBN } from "../hooks/useMediaQuery"
import { useUserSyncCheck } from "../hooks/useUserSyncCheck"
import SocketWrapper from "../components/SocketWrapper"
import { PageHeaderProvider, PageHeaderSlot } from "../context/PageHeaderContext"

const ProtectedLayout: FunctionComponent = () => {
	const { settings } = useApp();
	const isMobile = useIsMobile();
	const isNativeMobile = useIsNativeMobile();
	const isEBN = useIsEBN();
	const isNotDesktopEnv = !isElectron()
	const showWebNav = isNotDesktopEnv && !isNativeMobile && !isEBN

	// Reactive user status check after sync pulls (deactivation / force password reset)
	useUserSyncCheck();

	return (
		<SocketWrapper>
			<PageHeaderProvider>
				<div className="flex h-screen transition-colors duration-300 relative">
					{showWebNav && !isMobile && (
						<aside className="hidden md:flex flex-shrink-0 w-64 z-30 relative">
							<div className="w-64 h-full">
								<NavBar variant="sidebar" />
							</div>
						</aside>
					)}

					<div className="flex flex-col flex-1 min-w-0 z-10">
						{showWebNav && (
							<header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-20 relative">
								<NavBar variant="topbar" />
							</header>
						)}

						{/* Page header slot — PageHeader portals here, between topbar and main */}
						<PageHeaderSlot />

						<main className="flex-1 overflow-auto text-gray-700 dark:text-gray-300 relative z-0">
							<Outlet />
						</main>
						{!isNativeMobile && (
							<div className="border-t border-gray-200 dark:border-gray-700">
								<Footer />
							</div>
						)}
					</div>
				</div>
			</PageHeaderProvider>
		</SocketWrapper>
	)
}

export default ProtectedLayout