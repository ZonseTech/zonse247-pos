import { FunctionComponent, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone, Mail, MessageCircle, Clock, MapPin, Globe, Headphones } from 'lucide-react';
import { HiOutlineChatAlt2, HiOutlineSupport } from 'react-icons/hi';

const HelpModal: FunctionComponent = () => {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    const contactInfo = {
        phone: '+265 991 593 543',
        email: 'support@zonse247.com',
        whatsapp: '+265 991 593 543',
        hours: 'Mon - Fri: 8:00 AM - 6:00 PM',
        address: 'Lilongwe, Malawi',
        website: 'www.zonse247.com',
    };

    const handlePhoneCall = () => {
        window.location.href = `tel:${contactInfo.phone.replace(/\s/g, '')}`;
    };

    const handleEmail = () => {
        window.location.href = `mailto:${contactInfo.email}`;
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent('Hello, I need help with Zonse247 POS');
        window.open(`https://wa.me/${contactInfo.whatsapp.replace(/\s/g, '').replace('+', '')}?text=${message}`, '_blank');
    };

    return (
        <>
            <HiOutlineChatAlt2
                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                onClick={() => setIsHelpModalOpen(true)}
            />

            {isHelpModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60]">
                    <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-lg shadow-xl overflow-hidden animate-slide-up sm:animate-fade-in">
                        <div className="flex items-center justify-between px-4 py-4 bg-sky-500 dark:bg-sky-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <Headphones className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Help & Support</h2>
                                    <p className="text-sky-100 text-sm">We're here to help you</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsHelpModalOpen(false)}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={handlePhoneCall}
                                    className="flex flex-col items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors active:scale-95"
                                >
                                    <div className="p-2 bg-emerald-500 rounded-full">
                                        <Phone className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Call Us</span>
                                </button>

                                <button
                                    onClick={handleWhatsApp}
                                    className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors active:scale-95"
                                >
                                    <div className="p-2 bg-green-500 rounded-full">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-green-700 dark:text-green-400">WhatsApp</span>
                                </button>

                                <button
                                    onClick={handleEmail}
                                    className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors active:scale-95"
                                >
                                    <div className="p-2 bg-blue-500 rounded-full">
                                        <Mail className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Email</span>
                                </button>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                    Contact Information
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{contactInfo.phone}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{contactInfo.email}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{contactInfo.hours}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{contactInfo.address}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Globe className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{contactInfo.website}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <HiOutlineSupport className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Need quick answers? Check our FAQ section in Settings for common questions.
                                </p>
                            </div>
                        </div>

                        <div className="px-4 pb-4">
                            <button
                                onClick={() => setIsHelpModalOpen(false)}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-[0.98]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default HelpModal;
