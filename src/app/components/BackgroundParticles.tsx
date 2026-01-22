import { Fragment } from 'react'
import { motion } from 'framer-motion';
import type { FunctionComponent } from 'react'

const BackgroundParticles: FunctionComponent = () => {
	return (
		<Fragment>
			<div className="fixed inset-0 pointer-events-none z-0">
				{[...Array(20)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-2 h-2 bg-sky-500/20 rounded-full"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
						}}
						animate={{
							y: [0, -30, 0],
							opacity: [0, 1, 0],
							scale: [0, 1, 0],
						}}
						transition={{
							duration: 3 + Math.random() * 2,
							repeat: Infinity,
							delay: Math.random() * 2,
							ease: "easeInOut"
						}}
					/>
				))}
			</div>
		</Fragment>
	)
}

export default BackgroundParticles