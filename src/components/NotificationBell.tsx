import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosConfig';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    is_read: number;
    created_at: string;
}

export const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const [notiRes, countRes] = await Promise.all([
                api.get('/api/notifications?limit=10'),
                api.get('/api/notifications/unread-count')
            ]);
            setNotifications(notiRes.data);
            setUnreadCount(countRes.data.count);
        } catch { /* ignore */ }
    };

    useEffect(() => { fetchNotifications(); }, [user]);

    // Poll mỗi 30s
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Click outside to close
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch { /* ignore */ }
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Vừa xong';
        if (mins < 60) return `${mins} phút trước`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return `${Math.floor(hours / 24)} ngày trước`;
    };

    if (!user) return null;

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition cursor-pointer">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-orange-600 hover:underline cursor-pointer">
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">Chưa có thông báo</div>
                        ) : (
                            notifications.map(noti => (
                                <div key={noti.id}
                                    className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${!noti.is_read ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{noti.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{noti.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{timeAgo(noti.created_at)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
