import Header from './partials/Header ';
import Breadcrumb from './partials/Breadcrumb ';
import type { FunctionComponent } from 'react';
import AnnouncementBar from './partials/AnnouncementBar';
import HeroSection from './partials/HeroSection';
import FeaturesSection from './partials/FeaturesSection';
import BackgroundParticles from '../../components/BackgroundParticles';
import FloatingChatButton from './partials/FloatingChatButton';

const LandingPage: FunctionComponent = () => {
	const fadeInUp = {
		hidden: { opacity: 0, y: 60 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.8, ease: "easeOut" }
		}
	};

	const fadeInLeft = {
		hidden: { opacity: 0, x: -60 },
		visible: {
			opacity: 1,
			x: 0,
			transition: { duration: 0.8, ease: "easeOut" }
		}
	};

	const fadeInRight = {
		hidden: { opacity: 0, x: 60 },
		visible: {
			opacity: 1,
			x: 0,
			transition: { duration: 0.8, ease: "easeOut" }
		}
	};

	const staggerContainer = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				delayChildren: 0.1
			}
		}
	};

	const scaleIn = {
		hidden: { scale: 0.8, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: { duration: 0.6, ease: "backOut" }
		}
	};

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
			<AnnouncementBar />

			<Header
				staggerContainer={staggerContainer}
				fadeInLeft={fadeInLeft}
				fadeInRight={fadeInRight}
			/>

			<Breadcrumb
				fadeInUp={fadeInUp}
				staggerContainer={staggerContainer}
			/>

			<HeroSection
				staggerContainer={staggerContainer}
				fadeInUp={fadeInUp}

			/>

			<FeaturesSection
				staggerContainer={staggerContainer}
				scaleIn={scaleIn}
				fadeInUp={fadeInUp}
			/>

			<FloatingChatButton />

			<BackgroundParticles />
		</div>
	);
};

export default LandingPage;
