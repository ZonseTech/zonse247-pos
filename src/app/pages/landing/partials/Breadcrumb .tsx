import { Fragment } from 'react'
import { motion } from 'framer-motion'
import type { FunctionComponent } from 'react'
import { ChevronRight } from 'lucide-react'

const Breadcrumb: FunctionComponent<{ staggerContainer, fadeInUp }> = ({ staggerContainer, fadeInUp }) => {
	return (
		<Fragment>
			<motion.div
				className="bg-white dark:bg-gray-900 border-none"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.4, duration: 0.6 }}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
					<motion.div
						className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
					>
						<motion.span
							className="text-[#102f4f] dark:text-white hover:underline cursor-pointer"
							variants={fadeInUp}
							whileHover={{ scale: 1.05 }}
						>
							Zonse247 Group
						</motion.span>
						<motion.div variants={fadeInUp}>
							<ChevronRight className="w-4 h-4" />
						</motion.div>
						<motion.span
							className="text-[#102f4f] dark:text-white hover:underline cursor-pointer"
							variants={fadeInUp}
							whileHover={{ scale: 1.05 }}
						>
							Products
						</motion.span>
						<motion.div variants={fadeInUp}>
							<ChevronRight className="w-4 h-4" />
						</motion.div>
						<motion.span
							className="text-[#102f4f] dark:text-white"
							variants={fadeInUp}
						>
							Point of Sale
						</motion.span>
					</motion.div>
				</div>
			</motion.div>
		</Fragment>
	)
}

export default Breadcrumb 