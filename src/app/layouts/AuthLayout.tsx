import { motion } from 'framer-motion'
import { Zonse247Logo } from '../assets/images'
import type { FunctionComponent, PropsWithChildren } from 'react'
import { version } from '../../../package.json'
import BackgroundParticles from '../components/BackgroundParticles'
import Footer from '../components/Footer'
import DarkMode from '../components/DarkMode'

const Link: FunctionComponent<PropsWithChildren<any>> = ({ to, className, children, ...props }) => (
    <motion.a
        href={to}
        className={className}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
    >
        {children}
    </motion.a>
)

const containerVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 20
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: "easeOut",
            staggerChildren: 0.2
        }
    }
} as any

const itemVariants = {
    hidden: {
        opacity: 0,
        x: -20
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
} as any

const logoVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    },
    hover: {
        scale: 1.05,
        transition: {
            duration: 0.3
        }
    }
} as any

interface AuthLayoutProps {
    className?: string
    showKeyboard?: boolean
    keyboard?: React.ReactNode
}

const AuthLayout: FunctionComponent<PropsWithChildren<AuthLayoutProps>> = ({
    className,
    children,
    showKeyboard = false,
    keyboard
}) => {
    return (
        <div className="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
            <motion.header
                className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-none"
                initial={{ y: -80 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <motion.div
                        variants={logoVariants}
                        whileHover="hover"
                    >
                        <Link
                            to={'/'}
                            className="flex items-center gap-3 group"
                        >
                            <motion.img
                                src={Zonse247Logo}
                                alt="Zonse247 Logo"
                                className="h-10 object-contain"
                            />
                        </Link>
                    </motion.div>
                    <div className='flex items-center justify-between'>
                        <DarkMode color="bg-[#102f4f]" />
                        <div className="text-xs mx-4 text-gray-500 dark:text-gray-400">
                            v{version || '1.0.0'}
                        </div>
                    </div>
                </div>
            </motion.header>

            <motion.div
                className={`flex-1 flex justify-center px-6 ${showKeyboard ? 'pb-8 pt-8 overflow-auto' : 'py-16'}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className={`w-full max-w-md ${className}`}
                    variants={itemVariants}
                >
                    <motion.div variants={itemVariants}>
                        {children}
                    </motion.div>
                </motion.div>
            </motion.div>

            {keyboard && showKeyboard && (
                <div className="flex-none bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {keyboard}
                </div>
            )}

            <motion.footer
                className="py-2 border-t border-gray-200 dark:border-gray-700"
                initial={{ y: 80 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="max-w-7xl mx-auto px-3 text-center">
                    <Footer />
                </div>
            </motion.footer>

            <BackgroundParticles />
        </div>
    )
}

export default AuthLayout