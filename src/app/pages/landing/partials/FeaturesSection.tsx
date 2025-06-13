import { useRef, Fragment } from 'react'
import { type FunctionComponent } from 'react'
import { motion, useInView } from 'framer-motion';

const FeaturesSection: FunctionComponent<{ staggerContainer, scaleIn, fadeInUp }> = ({ staggerContainer, scaleIn, fadeInUp }) => {
	const featuresRef = useRef(null);
	const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 });

	return (
		<Fragment>
			<motion.section
				ref={featuresRef}
				className="pb-12 -mt-20 pt-14 dark:bg-gray-800 transition-colors"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1, delay: 0.8 }}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
					<motion.div
						className="text-center mb-12"
						variants={staggerContainer}
						initial="hidden"
						animate={featuresInView ? "visible" : "hidden"}
					>
						<motion.p
							className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-4"
							variants={scaleIn}
						>
							Why Choose ZONSE247 POS?
						</motion.p>

						<motion.h2
							className="text-3xl lg:text-4xl font-bold text-[#102f4f] dark:text-white leading-tight max-w-4xl mx-auto"
							variants={fadeInUp}
						>
							<motion.span
								className="inline-block"
								animate={{ rotateX: [0, 360, 0] }}
								transition={{ duration: 4, repeat: Infinity, delay: 1 }}
								style={{ transformOrigin: 'center center' }}
							>
								Designed
							</motion.span>{' '}
							for businesses on the move — print receipts, track inventory, and serve customers from anywhere.
						</motion.h2>
					</motion.div>
				</div>
			</motion.section>
		</Fragment>
	)
}

export default FeaturesSection