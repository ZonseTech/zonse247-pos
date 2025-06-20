import { motion } from 'framer-motion'
import { ImageLight, Zonse247Logo } from '../assets/images'
import type { FunctionComponent, PropsWithChildren } from 'react'
import BackgroundParticles from '../components/BackgroundParticles'

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
}

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
}

const logoVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        rotate: -10
    },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
            duration: 0.8,
            ease: "backOut"
        }
    },
    hover: {
        scale: 1.1,
        rotate: 3,
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
}

const imageVariants = {
    hidden: {
        opacity: 0,
        scale: 1.1
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 1.2,
            ease: "easeOut",
            delay: 0.4
        }
    }
}

const floatingVariants = {
    float: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

const AuthLayout: FunctionComponent<PropsWithChildren> = ({ children }) => {
    return (
        <div className="flex bg-gray-50 dark:bg-gray-700 items-center min-h-screen p-6 relative overflow-hidden">
            <motion.div
                className="absolute inset-0 opacity-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ duration: 2 }}
            >
                <motion.div
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-3/4 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.4, 0.1]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 4
                    }}
                />
            </motion.div>

            <motion.div
                className="flex-1 h-full max-w-4xl mx-auto overflow-hidden border border-gray-500/75 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="flex flex-col overflow-y-auto md:flex-row">
                    <main className="flex items-center justify-center p-12 sm:p-12 md:w-1/2 relative">
                        <motion.div
                            className="w-full"
                            variants={itemVariants}
                        >
                            <Link
                                to={'/'}
                                className="text-2xl font-semibold flex justify-center items-center mb-4 lg:mb-6 group"
                            >
                                <motion.div
                                    className="relative"
                                    variants={logoVariants}
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <motion.img
                                        src={Zonse247Logo}
                                        alt="Zonse247 Logo"
                                        className="h-28 mr-4 object-contain"
                                    />
                                </motion.div>
                            </Link>

                            <motion.div
                                variants={itemVariants}
                            >
                                {children}
                            </motion.div>
                        </motion.div>
                    </main>

                    <div className="h-20 md:h-auto md:w-1/2 relative overflow-hidden">
                        <motion.div
                            className="absolute inset-0"
                            variants={imageVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div
                                className="absolute inset-0 bg-green-400 rounded-lg blur-lg scale-110"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 0.2 }}
                                transition={{ duration: 0.3 }}
                            />

                            <motion.div
                                className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full opacity-60"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.6, 1, 0.6]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <motion.div
                                className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full opacity-40"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.4, 0.8, 0.4]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                            />

                            <motion.img
                                aria-hidden="true"
                                src={ImageLight}
                                alt="Office Logo"
                                className="object-cover w-full h-full"
                            />

                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10"
                                animate={{
                                    opacity: [0.1, 0.3, 0.1]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            <motion.div
                                className="absolute top-1/4 right-1/4 w-16 h-16 border-2 border-white/20 rounded-lg"
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    rotate: {
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: "linear"
                                    },
                                    scale: {
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }
                                }}
                            />

                            <motion.div
                                className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-white dark:bg-gray-700/10 rounded-full"
                                variants={floatingVariants}
                                animate="float"
                                transition={{ delay: 2, duration: 3 }}
                            />

                            <motion.div
                                className="absolute top-1/2 left-1/2 w-8 h-8 bg-gradient-to-br from-green-400/20 to-blue-400/20 rotate-45"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.2, 0.6, 0.2]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                            />
                        </motion.div>

                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{
                                duration: 2,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                        />
                    </div>
                </div>
            </motion.div>

            <BackgroundParticles />
        </div>
    )
}

export default AuthLayout