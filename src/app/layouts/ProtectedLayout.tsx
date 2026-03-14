import NavBar from "../navigation/NavBar"
import Footer from "../components/Footer"
import { Outlet } from "react-router"
import { type FunctionComponent } from "react"
import { isElectron } from "../../helpers/index.helper"
import { useApp } from "../context/AppProvider"
import { useLayout } from "../context/LayoutContext"
import { useIsMobile, useIsNativeMobile, useIsEBN } from "../hooks/useMediaQuery"
import classNames from "classnames"

const ProtectedLayout: FunctionComponent = () => {
	const { settings } = useApp();
	const isMobile = useIsMobile();
	const isNativeMobile = useIsNativeMobile();
	const isEBN = useIsEBN();
	const isNotDesktopEnv = !isElectron()
	const showWebNav = isNotDesktopEnv && !isNativeMobile && !isEBN

	return (
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

				<main className="flex-grow overflow-hidden md:pt-2.5 text-gray-700 dark:text-gray-300 relative z-0">
					<div className="h-full overflow-auto">
						<div className="min-h-full md:px-4">
							<Outlet />
						</div>
					</div>
				</main>
				{!isNativeMobile && (
					<div className="border-t border-gray-200 dark:border-gray-700">
						<Footer />
					</div>
				)}
			</div>
		</div>
	)
}

export default ProtectedLayout