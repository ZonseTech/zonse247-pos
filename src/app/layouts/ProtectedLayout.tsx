import { Outlet } from "react-router"
import { type FunctionComponent } from "react"
import NavBar from "../navigation/NavBar"

const ProtectedLayout: FunctionComponent = () => {
	return (
		<div className="flex flex-col h-screen bg-radial-green px-4 shadow-md text-gray-600 dark:bg-gray-500">
			<NavBar />
			<main className="flex-grow overflow-hidden">
				<Outlet />
			</main>
		</div>
	)
}

export default ProtectedLayout