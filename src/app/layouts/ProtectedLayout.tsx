import { Outlet } from "react-router"
import { type FunctionComponent } from "react"
import NavBar from "../navigation/NavBar"

const ProtectedLayout: FunctionComponent = () => {
	return (
		<div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
			<header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
				<NavBar />
			</header>

			<main className="flex-grow overflow-hidden pt-2.5 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
				<div className="h-full overflow-auto">
					<div className="min-h-full px-4">
						<Outlet />
					</div>
				</div>
			</main>
		</div>
	)
}

export default ProtectedLayout