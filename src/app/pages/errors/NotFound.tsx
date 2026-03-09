import { Button } from '../../components'
import { ROUTES } from '../../utils/constants'
import { useNavigate } from 'react-router-dom'
import { FunctionComponent, useState, useEffect } from 'react'
import {
    Home,
    ArrowLeft,
    Package,
    ShoppingCart,
    LayoutDashboard,
    Boxes,
    User,
    DownloadCloudIcon,
    FileText,
    Receipt,
    FolderTree,
    Users,
    Settings,
    Printer
} from 'lucide-react'

const NotFound: FunctionComponent = () => {
    const navigate = useNavigate()
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1)
        } else {
            navigate(ROUTES.POS)
        }
    }

    const parallaxX = (mousePosition.x - window.innerWidth / 2) / 50
    const parallaxY = (mousePosition.y - window.innerHeight / 2) / 50

    // Main navigation routes from menu.ts
    const quickLinks = [
        { label: 'Point of Sale', route: ROUTES.POS, icon: ShoppingCart },
        { label: 'Inventory', route: ROUTES.INVENTORY, icon: Boxes },
        { label: 'Reports', route: ROUTES.REPORTS, icon: FileText },
        { label: 'My Profile', route: ROUTES.MY_PROFILE, icon: User },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8 overflow-hidden relative">
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse"
                    style={{ transform: `translate(${parallaxX}px, ${parallaxY}px)` }}
                />
                <div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"
                    style={{ transform: `translate(${-parallaxX}px, ${-parallaxY}px)` }}
                />
            </div>

            <div className="relative z-10 max-w-4xl w-full">
                <div className="text-center space-y-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <div className="text-[20rem] font-bold text-sky-500/20 select-none">404</div>
                        </div>
                        <div className="relative space-y-4 pt-16">
                            <div className="flex items-center justify-center gap-4 mb-8">
                                <div className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 animate-bounce delay-100">
                                    <Package className="w-12 h-12 text-sky-400" />
                                </div>
                                <div className="text-9xl font-bold bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                                    404
                                </div>
                                <div className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 animate-bounce delay-300">
                                    <ShoppingCart className="w-12 h-12 text-purple-400" />
                                </div>
                            </div>

                            <h1 className="text-4xl font-bold text-white">Page Not Found</h1>
                            <p className="text-xl text-slate-400 max-w-md mx-auto">
                                Looks like this item isn't in our inventory. The page you're looking for doesn't exist or has been moved.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <Button
                            theme='primary'
                            onClick={() => navigate(ROUTES.POS)}
                            className="group relative flex items-center gap-2 w-full sm:w-auto"
                        >
                            <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                            Back to Point of Sale
                        </Button>

                        <Button
                            theme='neutral'
                            onClick={handleGoBack}
                            className="group relative flex items-center gap-2 w-full sm:w-auto"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Go Back
                        </Button>
                    </div>

                    <div className="pt-12">
                        <p className="text-sm text-slate-500 mb-4">Quick navigation</p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {quickLinks.map((link) => {
                                const Icon = link.icon
                                return (
                                    <button
                                        key={link.route}
                                        onClick={() => navigate(link.route)}
                                        className="group px-4 py-2 bg-slate-800/50 backdrop-blur-sm text-slate-400 rounded-lg text-sm hover:bg-slate-800 hover:text-slate-300 transition-all duration-200 border border-slate-700/30 hover:border-slate-600/50 flex items-center gap-2"
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="pt-8 text-xs text-slate-600">
                        Error Code: 404 • Page Not Found
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotFound