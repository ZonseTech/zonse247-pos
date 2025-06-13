import { Fragment } from 'react'
import { Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import type { FunctionComponent } from 'react'
import DarkMode from '../../../components/DarkMode'
import { Zonse247Logo } from '../../../assets/images'

const Header: FunctionComponent<{
	staggerContainer,
	fadeInLeft,
	fadeInRight
}> = ({
	staggerContainer,
	fadeInLeft,
	fadeInRight
}) => {
		return (
			<Fragment>
				<motion.header
					className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-gray-800/90"
					initial={{ y: -100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
						<motion.div
							className="flex items-center justify-between py-0"
							variants={staggerContainer}
							initial="hidden"
							animate="visible"
						>
							<motion.div
								className="flex items-center space-x-2"
								variants={fadeInLeft}
								whileHover={{ scale: 1.05 }}
							>
								<motion.img
									src={Zonse247Logo}
									alt="Zonse247 Logo"
									className="w-14 h-14 object-contain"
									whileHover={{ rotate: 360 }}
									transition={{ duration: 0.6 }}
								/>
							</motion.div>

							<motion.div
								className="flex items-center space-x-4"
								variants={fadeInRight}
							>
								<DarkMode color="bg-[#102f4f]" />
								<motion.button
									className="border-2 border-[#102f4f] text-[#102f4f] dark:text-white dark:border-white px-4 py-1.5 rounded-sm font-semibold hover:bg-[#102f4f] hover:text-white dark:hover:bg-gray-700 dark:hover:text-white transition-all flex items-center justify-start space-x-2 overflow-hidden relative"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<motion.div
										className="absolute inset-0 bg-[#102f4f] dark:bg-white"
										initial={{ x: '-100%' }}
										whileHover={{ x: 0 }}
										transition={{ duration: 0.3 }}
									/>
									<Phone className="w-5 h-5 relative z-10" />
									<span className="relative z-10">Contact Us</span>
								</motion.button>
							</motion.div>
						</motion.div>
					</div>
				</motion.header>
			</Fragment>
		)
	}

export default Header 