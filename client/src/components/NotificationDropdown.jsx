import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Activity, 
  Compass, 
  Award, 
  Search, 
  Info,
  ExternalLink
} from 'lucide-react';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} from '../services/apiClient.js';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getNotificationIcon(type) {
  switch (type) {
    case 'telemetry':
      return <Activity size={16} className="text-cyan-500" />;
    case 'mystery':
      return <Search size={16} className="text-amber-500" />;
    case 'expedition':
      return <Compass size={16} className="text-blue-500" />;
    case 'badge':
      return <Award size={16} className="text-emerald-500" />;
    default:
      return <Info size={16} className="text-primary" />;
  }
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications();
      if (data?.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Quiet fail if network or auth error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 min polling
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleItemClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Continue navigation regardless
      }
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Continue
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        aria-label="Notifications"
        type="button"
        onClick={handleToggle}
        className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors flex items-center justify-center cursor-pointer"
        title="Field telemetry & scholar notifications"
      >
        <Bell size={19} className="text-on-surface-variant" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-error text-white font-data-tabular text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-container-lowest animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-surface-container-low border-b border-surface-container-high/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-body-md font-bold text-on-surface">
                Scholar Alerts
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary-container/20 text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-label-sm text-primary hover:text-primary-variant font-semibold flex items-center gap-1 hover:underline transition-all"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-surface-container-high/40">
            {isLoading && notifications.length === 0 ? (
              <div className="py-8 text-center text-body-sm text-outline">
                Loading notifications…
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-body-sm text-outline flex flex-col items-center gap-2">
                <Bell size={28} className="opacity-40" />
                <span>No active polar notifications</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleItemClick(notif)}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-start gap-3 hover:bg-surface-container-low ${
                    !notif.read ? 'bg-primary-container/5' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-surface-container-high/60 shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className={`text-body-sm font-semibold truncate ${!notif.read ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {notif.title}
                      </h4>
                      <span className="font-data-tabular text-[11px] text-outline shrink-0">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-body-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.link && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-primary font-medium">
                        <span>View Details</span>
                        <ExternalLink size={10} />
                      </div>
                    )}
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-surface-container-low/60 border-t border-surface-container-high/60 text-center">
            <span className="text-[11px] text-outline font-data-tabular">
              MoES Polar Alert Relay · NCPOR Telemetry Node
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
