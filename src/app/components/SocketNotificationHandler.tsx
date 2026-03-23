import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useSocketContext } from '../context/SocketContext';

/**
 * Listens for incoming branch notifications from the socket and
 * surfaces them as toast messages.  Renders nothing — just listens.
 *
 * Must be rendered inside a `<SocketProvider>`.
 *
 * @see WEBSOCKET_FRONTEND_GUIDE.md §5 – Notification Toast Handler
 */
export function SocketNotificationHandler() {
    const { notifications } = useSocketContext();
    const prevCountRef = useRef(0);

    useEffect(() => {
        // Only react to new notifications (not the full array rebuild)
        if (notifications.length === 0 || notifications.length <= prevCountRef.current) {
            prevCountRef.current = notifications.length;
            return;
        }

        prevCountRef.current = notifications.length;
        const latest = notifications[0];
        if (!latest) return;

        const message = latest.title
            ? `${latest.title}: ${latest.message}`
            : latest.message;

        switch (latest.priority) {
            case 'critical':
                toast.error(message, { autoClose: false });
                break;
            case 'high':
                toast.warning(message, { autoClose: 8000 });
                break;
            case 'normal':
                toast.info(message);
                break;
            case 'low':
            default:
                toast.info(message, { autoClose: 3000 });
                break;
        }
    }, [notifications]);

    return null;
}
