import { motion } from 'framer-motion';
import { HiChat } from 'react-icons/hi';
import { Fragment, type FunctionComponent } from 'react'

const FloatingChatButton: FunctionComponent<{}> = ({ }) => {
	return (
		<Fragment>
			<motion.div
				className="fixed bottom-4 right-4 z-50"
				initial={{ scale: 0, rotate: -180 }}
				animate={{ scale: 1, rotate: 0 }}
				transition={{
					type: "spring",
					stiffness: 200,
					damping: 20,
					delay: 1.5
				}}
			>
				<motion.button
					className="bg-[#ffd200] text-[#102f4f] px-4 py-3 rounded-sm shadow-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 dark:bg-green-300 dark:hover:bg-green-400 relative overflow-hidden"
					whileHover={{
						scale: 1.1,
						boxShadow: "0 10px 30px rgba(255,210,0,0.4)"
					}}
					whileTap={{ scale: 0.95 }}
					animate={{
						y: [0, -5, 0],
						boxShadow: [
							"0 5px 15px rgba(255,210,0,0.3)",
							"0 10px 25px rgba(255,210,0,0.4)",
							"0 5px 15px rgba(255,210,0,0.3)"
						]
					}}
					transition={{
						y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
						boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
					}}
				>
					<motion.div
						className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500"
						initial={{ scale: 0, borderRadius: '50%' }}
						whileHover={{ scale: 1, borderRadius: '0%' }}
						transition={{ duration: 0.4 }}
					/>
					<motion.div
						className="relative z-10"
						animate={{ rotate: [0, 15, -15, 0] }}
						transition={{ duration: 2, repeat: Infinity, delay: 2 }}
					>
						<HiChat className="w-5 h-5" />
					</motion.div>
					<span className="text-sm font-semibold relative z-10">Need Help? Let's Chat!</span>
				</motion.button>
			</motion.div>
		</Fragment>
	)
}

export default FloatingChatButton