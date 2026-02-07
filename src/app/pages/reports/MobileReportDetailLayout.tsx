import React from 'react'
import { useNavigate } from 'react-router'
import { HiArrowLeft, HiShare } from 'react-icons/hi'

interface MobileReportDetailLayoutProps {
    title: string
    children: React.ReactNode
    onShare?: () => void
}

const MobileReportDetailLayout: React.FC<MobileReportDetailLayoutProps> = ({
    title,
    children,
    onShare,
}) => {
    const navigate = useNavigate()

    const handleShare = async (): Promise<void> => {
        if (onShare) {
            onShare()
            return
        }

        if (!navigator.share) return

        try {
            await navigator.share({
                title,
                text: `Check out ${title} report`,
                url: window.location.href,
            })
        } catch (error) {
            console.error('Error sharing:', error)
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-primary-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <HiArrowLeft
                        className="w-6 h-6 cursor-pointer active:scale-95 transition-transform"
                        onClick={() => navigate(-1)}
                    />
                    <h1 className="text-lg font-semibold">{title}</h1>
                </div>
                <HiShare
                    className="w-6 h-6 cursor-pointer active:scale-95 transition-transform"
                    onClick={handleShare}
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto pt-[52px] pb-6">
                {children}
            </div>
        </div>
    )
}

export default MobileReportDetailLayout
