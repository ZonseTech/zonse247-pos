import { useState, useEffect, FunctionComponent } from 'react'
import { useAuth } from '../context/AuthProvider';
import { Clock, User } from 'lucide-react';

const Footer: FunctionComponent = () => {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date())
        }

        const timer = setInterval(updateTime, 1000)

        return () => clearInterval(timer)
    }, [])

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    return (
        <div className="flex justify-between items-center text-xl text-gray-600 mb-3">
            <div className="flex items-center gap-2">
                <Clock className="w-6 h-6" />
                <span>{formatTime(currentTime)}</span>
            </div>

            <span>Zonse247 Pos @ {currentTime.getFullYear()}</span>

            <div className="flex items-center gap-2">
                <User className="w-6 h-6" />
                <span>{user?.fullname}</span>
            </div>
        </div>
    )
}

export default Footer