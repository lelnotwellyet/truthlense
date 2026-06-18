import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineBellAlert,
  HiOutlinePaperAirplane,
  HiOutlineMegaphone,
} from 'react-icons/hi2';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../config/api';

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sentHistory, setSentHistory] = useState([]);

  const sendMutation = useMutation({
    mutationFn: (body) => api.post('/admin/notifications', body),
    onSuccess: () => {
      toast.success('Notification sent to all users!');
      setSentHistory((prev) => [
        { title, message, sentAt: new Date().toISOString() },
        ...prev,
      ]);
      setTitle('');
      setMessage('');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to send notification'),
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }
    sendMutation.mutate({ title: title.trim(), message: message.trim() });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2.5 rounded-xl bg-amber/10 text-amber-400">
          <HiOutlineBellAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Broadcast Notifications</h2>
          <p className="text-sm text-navy-300">Send announcements to all users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Send Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 glass rounded-2xl p-6"
        >
          <div className="flex items-center space-x-2 mb-6">
            <HiOutlineMegaphone className="w-5 h-5 text-accent-400" />
            <h3 className="text-lg font-semibold text-white">New Announcement</h3>
          </div>

          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-200 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. System Maintenance Notice"
                className="input-field"
                maxLength={120}
              />
              <p className="text-xs text-navy-500 mt-1">{title.length}/120 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-200 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement message here..."
                className="input-field min-h-[140px] resize-y"
                maxLength={1000}
              />
              <p className="text-xs text-navy-500 mt-1">{message.length}/1000 characters</p>
            </div>

            {/* Preview */}
            {(title || message) && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-navy-400 uppercase tracking-wider mb-2">Preview</p>
                <p className="text-sm font-semibold text-white">{title || 'Untitled'}</p>
                <p className="text-sm text-navy-200 mt-1 whitespace-pre-wrap">{message || 'No message'}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={sendMutation.isPending || !title.trim() || !message.trim()}
              className="btn-primary flex items-center space-x-2 w-full justify-center"
            >
              {sendMutation.isPending ? (
                <span>Sending...</span>
              ) : (
                <>
                  <HiOutlinePaperAirplane className="w-4 h-4" />
                  <span>Send to All Users</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Sent History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recently Sent</h3>

          {sentHistory.length === 0 ? (
            <div className="text-center py-10">
              <HiOutlineBellAlert className="w-10 h-10 text-navy-600 mx-auto mb-3" />
              <p className="text-sm text-navy-400">
                No notifications sent yet this session.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {sentHistory.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-semibold text-white line-clamp-1">{item.title}</p>
                    <span className="badge-credible ml-2 flex-shrink-0">Sent</span>
                  </div>
                  <p className="text-xs text-navy-300 line-clamp-2">{item.message}</p>
                  <p className="text-xs text-navy-500 mt-2">
                    {new Date(item.sentAt).toLocaleTimeString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
