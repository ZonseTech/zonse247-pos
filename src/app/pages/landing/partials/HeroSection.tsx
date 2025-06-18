import { Fragment, useRef } from 'react'
import { ChevronRight } from 'lucide-react';
import type { FunctionComponent } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../utils/constants';

const HiChevronDoubleRight = ({ className }) => <ChevronRight className={className} />;

const HeroSection: FunctionComponent<{ staggerContainer, fadeInUp }> = ({ staggerContainer, fadeInUp }) => {
	const heroRef = useRef(null);
	const navigate = useNavigate();
	const { scrollY } = useScroll();

	const heroY = useTransform(scrollY, [0, 500], [0, -100]);
	const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
	const heroInView = useInView(heroRef, { once: true, amount: 0.3 });

	return (
		<Fragment>
			<motion.section
				ref={heroRef}
				className="relative h-[63vh] overflow-hidden"
				style={{
					clipPath: 'polygon(0 0, calc(100% - 50vw) 12%, 100% 3.7%, 100% 100%, 50% 87%, 0 100%)',
					y: heroY,
					opacity: heroOpacity
				}}
			>
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-teal-800 to-teal-900"
					initial={{ scale: 1.2, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 1.5, ease: "easeOut" }}
				>
					<motion.div
						className="absolute inset-0 bg-gradient-to-br from-[#102f4f] via-[#102f4f] to-cyan-700 dark:from-gray-800 dark:via-gray-900 dark:to-teal-900"
						animate={{
							background: [
								'linear-gradient(135deg, #102f4f 0%, #102f4f 50%, #0891b2 100%)',
								'linear-gradient(135deg, #0891b2 0%, #102f4f 50%, #102f4f 100%)',
								'linear-gradient(135deg, #102f4f 0%, #102f4f 50%, #0891b2 100%)',
							]
						}}
						transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
					/>
				</motion.div>

				<motion.div
					className="absolute inset-0"
					initial={{ x: 100, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
				>
					<motion.img
						src="https://koronapos.com/wp-content/uploads/2023/09/Desktop-Tablet-KPhone.png"
						alt="Mobile Printer being used by worker"
						className="w-full h-full object-cover bg-gray-50 dark:bg-gray-900"
						style={{
							clipPath: 'polygon(calc(100% - 50vw) 0, 100% 0, 100% 100%, calc(100% - 50vw) 100%)'
						}}
						animate={{ scale: [1, 1.05, 1] }}
						transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
					/>
				</motion.div>

				<div className="relative z-10 h-full flex items-center">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
						<motion.div
							className="max-w-lg"
							variants={staggerContainer}
							initial="hidden"
							animate={heroInView ? "visible" : "hidden"}
						>
							<motion.p
								className="text-sm font-semibold tracking-wider uppercase mb-4 text-white dark:text-gray-100 opacity-90"
								variants={fadeInUp}
							>
								Fast, Reliable & Portable — The Ultimate POS Experience
							</motion.p>

							<motion.h1
								className="text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white dark:text-gray-100"
								variants={fadeInUp}
							>
								<motion.span
									className="inline-block"
									animate={{
										color: ['#ffffff', '#ffd700', '#ffffff'],
										textShadow: [
											'0 0 0px rgba(255,215,0,0)',
											'0 0 20px rgba(255,215,0,0.5)',
											'0 0 0px rgba(255,215,0,0)'
										]
									}}
									transition={{ duration: 3, repeat: Infinity }}
								>
									Smarter
								</motion.span>{' '}
								<motion.span
									className="inline-block"
									animate={{ y: [0, -5, 0] }}
									transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
								>
									Sales
								</motion.span>
							</motion.h1>

							<motion.div
								className="flex flex-row gap-4"
								variants={fadeInUp}
							>
								<motion.div className="group inline-block">
									<motion.button
										className="px-6 py-3 rounded-sm font-semibold flex items-center justify-center space-x-2 transition-all text-[#102f4f] bg-white dark:bg-gray-700 hover:bg-gray-100 relative overflow-hidden"
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										animate={{
											boxShadow: [
												'0 4px 15px rgba(255,255,255,0.2)',
												'0 8px 25px rgba(255,255,255,0.4)',
												'0 4px 15px rgba(255,255,255,0.2)'
											]
										}}
										transition={{ duration: 2, repeat: Infinity }}
										onClick={() => navigate(ROUTES.GET_STARTED)}
									>
										<motion.div
											className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500"
											initial={{ x: '-100%' }}
											whileHover={{ x: 0 }}
											transition={{ duration: 0.3 }}
										/>
										<span className="relative z-10">Get Started</span>
										<motion.div
											className="relative z-10"
											animate={{ x: [0, 5, 0] }}
											transition={{ duration: 1.5, repeat: Infinity }}
										>
											<HiChevronDoubleRight className="w-5 h-5" />
										</motion.div>
									</motion.button>
								</motion.div>
							</motion.div>
						</motion.div>
					</div>
				</div>
			</motion.section>

		</Fragment>
	)
}

export default HeroSection