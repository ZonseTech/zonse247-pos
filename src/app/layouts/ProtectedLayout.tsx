import { Outlet } from "react-router-dom"
import NavBar from "../navigation/NavBar"
import Footer from "../components/Footer"
import { type FunctionComponent } from "react"
import { isElectron } from "../../helpers/index.helper"
import { useApp } from "../context/AppProvider"

const ProtectedLayout: FunctionComponent = () => {
	const { settings } = useApp();
	const isNotDesktopEnv = !isElectron()
	const showWebNav = isNotDesktopEnv || settings?.navigationMenuType === 'web'

	return (
		<div className="flex flex-col h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
			{showWebNav && (<header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
				<NavBar />
			</header>)}

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
	)
}

export default ProtectedLayout