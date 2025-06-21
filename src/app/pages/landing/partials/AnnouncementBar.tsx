import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { type FunctionComponent } from 'react'

const AnnouncementBar: FunctionComponent = () => {
	return (
		<Fragment>
			<motion.div
				className="bg-[#102f4f] text-white dark:text-gray-100 text-sm py-2 text-center relative overflow-hidden"
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
					animate={{ x: ['-100%', '100%'] }}
					transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
				/>
				<motion.span
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
				>
					🚀
				</motion.span>
				{' '}New! Now supporting mobile payments and real-time inventory sync.
			</motion.div>
		</Fragment>
	)
}

export default AnnouncementBar