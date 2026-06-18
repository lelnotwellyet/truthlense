import { motion, AnimatePresence } from 'framer-motion';
import {
  HiBell,
  HiCheckCircle,
  HiMegaphone,
  HiShieldCheck,
  HiCog6Tooth,
  HiEnvelopeOpen,
  HiInboxStack,
} from 'react-icons/hi2';
import { useNotifications, useMarkRead, useMarkAllRead, useUnreadCount } from '../hooks/useNotifications';
import { formatDate } from '../utils/formatters';
import Spinner from '../components/ui/Spinner';

const TYPE_STYLES = {
  announcement: {
    icon: HiMegaphone,
    color: 'text-accent-400',
    bg: 'bg-accent/10',
    label: 'Announcement',
  },
  verdict: {
    icon: HiShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald/10',
    label: 'Verdict',
  },
  system: {
    icon: HiCog6Tooth,
    color: 'text-amber-400',
    bg: 'bg-amber/10',
    label: 'System',
  },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export default function Notifications() {
  const { data: notifications, isLoading, error } = useNotifications();
  const unreadCount = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const handleMarkRead = (id) => {
    markRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white dark:text-white mb-2 flex items-center gap-3"
          >
            <HiBell className="h-8 w-8 text-accent-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/20 text-accent-400 border border-accent/30">
                {unreadCount}
              </span>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-navy-200"
          >
            Stay updated with verification results and announcements.
          </motion.p>
        </div>

        {unreadCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <HiEnvelopeOpen className="h-4 w-4" />
            {markAllRead.isPending ? 'Marking…' : 'Mark all as read'}
          </motion.button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass p-8 text-center">
          <p className="text-rose-400 font-medium">Failed to load notifications.</p>
          <p className="text-navy-300 text-sm mt-1">Please try again later.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!notifications || notifications.length === 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 text-center"
        >
          <HiInboxStack className="h-16 w-16 text-navy-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
          <p className="text-navy-300">You have no notifications. We'll let you know when something happens.</p>
        </motion.div>
      )}

      {/* Notification List */}
      {!isLoading && notifications && notifications.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => {
              const typeStyle = TYPE_STYLES[notification.type] || TYPE_STYLES.system;
              const Icon = typeStyle.icon;
              const isUnread = !notification.read;

              return (
                <motion.div
                  key={notification.id}
                  variants={item}
                  layout
                  className={`glass p-5 flex items-start gap-4 transition-all duration-300 ${
                    isUnread
                      ? 'border-l-4 border-l-accent-400 bg-white/[0.07]'
                      : 'border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl ${typeStyle.bg} flex items-center justify-center`}
                  >
                    <Icon className={`h-5 w-5 ${typeStyle.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isUnread ? 'text-white' : 'text-navy-100'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeStyle.bg} ${typeStyle.color}`}
                      >
                        {typeStyle.label}
                      </span>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-accent-400 flex-shrink-0" />
                      )}
                    </div>
                    <p
                      className={`text-sm line-clamp-2 ${
                        isUnread ? 'text-navy-100' : 'text-navy-300'
                      }`}
                    >
                      {notification.message}
                    </p>
                    <span className="text-xs text-navy-400 mt-1 block">
                      {formatDate(notification.created_at || notification.timestamp)}
                    </span>
                  </div>

                  {/* Mark as read */}
                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      disabled={markRead.isPending}
                      className="flex-shrink-0 p-2 rounded-xl text-navy-300 hover:text-emerald-400 hover:bg-white/5 transition-all"
                      title="Mark as read"
                    >
                      <HiCheckCircle className="h-5 w-5" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
