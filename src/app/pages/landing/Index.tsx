import {
	ChevronRight,
	LockKeyholeOpen
} from 'lucide-react';
import { useNavigate } from 'react-router';
import type { FunctionComponent } from 'react';
import { ROUTES } from '../../utils/constants';
import { Zonse247Logo } from '../../assets/images';
import { HiChat, HiChevronDoubleRight } from 'react-icons/hi';

const LandingPage: FunctionComponent = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-white">
			<div className="bg-[#102f4f] text-white text-sm py-2 text-center">
				🚀 New! Now supporting mobile payments and real-time inventory sync.
			</div>

			<header className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
					<div className="flex items-center justify-between py-0">
						<div className="flex items-center space-x-2">
							<img
								src={Zonse247Logo}
								alt="Zonse247 Logo"
								className="w-14 h-14 object-contain"
							/>
						</div>

						<div className="flex items-center space-x-4">
							<button
								onClick={() => {
									console.log('Navigating to login...');
									navigate(ROUTES.LOGIN);
								}}
								className="border-2 border-[#102f4f] text-[#102f4f] px-4 py-2 rounded-sm font-semibold hover:bg-white hover:text-[#102f4f] transition-colors flex items-center justify-start space-x-2"
							>
								<span>Sign In</span>
								<LockKeyholeOpen className="w-5 h-5" />
							</button>
						</div>
					</div>
				</div>
			</header>

			<div className="bg-white border-none">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
					<div className="flex items-center space-x-2 text-sm text-gray-600">
						<span className="text-[#102f4f] hover:underline cursor-pointer">Zonse247 Group</span>
						<ChevronRight className="w-4 h-4" />
						<span className="text-[#102f4f] hover:underline cursor-pointer">Products</span>
						<ChevronRight className="w-4 h-4" />
						<span className="text-[#102f4f]">Point of Sale</span>
					</div>
				</div>
			</div>

			<section className="relative h-[500px] overflow-hidden" style={{
				clipPath: 'polygon(0 0, calc(100% - 50vw) 12%, 100% 3.7%, 100% 100%, 50% 87%, 0 100%)'
			}}>
				<div className="absolute inset-0 bg-gradient-to-r from-teal-800 to-teal-900">
					<div
						className="absolute inset-0 bg-gradient-to-br from-[#102f4f] via-[#102f4f] to-cyan-700"
					/>
				</div>

				<div className="absolute inset-0">
					<img
						src="https://koronapos.com/wp-content/uploads/2023/09/Desktop-Tablet-KPhone.png"
						alt="Mobile Printer being used by worker"
						className="w-full h-full object-cover bg-gray-50"
						style={{
							clipPath: 'polygon(calc(100% - 50vw) 0, 100% 0, 100% 100%, calc(100% - 50vw) 100%)'
						}}
					/>
				</div>

				<div className="relative z-10 h-full flex items-center">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
						<div className="max-w-lg">
							<p className="text-sm font-semibold tracking-wider uppercase mb-4 text-white opacity-90">
								Fast, Reliable & Portable — The Ultimate POS Experience
							</p>
							<h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white">
								Smarter Sales
							</h1>
							<div className="flex flex-row gap-4">
								<button className="bg-white text-[#102f4f] px-4 py-2 rounded-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
									<span>GET STARTED</span>
									<HiChevronDoubleRight className="w-5 h-5" />
								</button>
							</div>
							<span className="text-xs text-white opacity-80 mt-4 block">
								Already have an account? Jump right back in!
							</span>
						</div>
					</div>
				</div>
			</section>

			<section className="pb-12 -mt-20 pt-14 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<p className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-4">
							Why Choose ZONSE247 POS?
						</p>
						<h2 className="text-3xl lg:text-4xl font-bold text-[#102f4f] leading-tight max-w-4xl mx-auto">
							Designed for businesses on the move — print receipts, track inventory, and serve customers from anywhere.
						</h2>
					</div>
				</div>
			</section>

			<div className="fixed bottom-4 right-44 z-50">
				<button className="bg-[#ffd200] text-[#102f4f] px-4 py-3 rounded-sm shadow-lg hover:bg-orange-700 transition-colors flex items-center space-x-2">
					<HiChat className="w-5 h-5" />
					<span className="text-sm font-semibold">Need Help? Let's Chat!</span>
				</button>
			</div>
		</div>
	);
};

export default LandingPage;
