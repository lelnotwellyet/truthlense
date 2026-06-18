import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUsers,
  HiOutlineMagnifyingGlass,
  HiOutlineShieldCheck,
  HiOutlineNoSymbol,
  HiOutlinePauseCircle,
  HiOutlinePlayCircle,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';

function getStatusBadge(user) {
  if (user.is_banned) return <span className="badge-misleading">Banned</span>;
  if (user.is_suspended) return <span className="badge-uncertain">Suspended</span>;
  return <span className="badge-credible">Active</span>;
}

function getRoleBadge(role) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent-400 border border-accent/30">
        <HiOutlineShieldCheck className="w-3 h-3 mr-1" /> Admin
      </span>
    );
  }
  return <span className="text-sm text-navy-200 capitalize">{role || 'user'}</span>;
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionModal, setActionModal] = useState(null); // { user, action }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await api.get('/admin/users', { params });
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => api.put(`/admin/users/${id}`, body),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActionModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update user'),
  });

  const handleAction = () => {
    if (!actionModal) return;
    const { user, action } = actionModal;
    let body = {};
    switch (action) {
      case 'ban':     body = { is_banned: true }; break;
      case 'unban':   body = { is_banned: false }; break;
      case 'suspend': body = { is_suspended: true }; break;
      case 'unsuspend': body = { is_suspended: false }; break;
      case 'make_admin': body = { role: 'admin' }; break;
      case 'make_user':  body = { role: 'user' }; break;
      default: return;
    }
    updateMutation.mutate({ id: user.id, body });
  };

  const getActionLabel = (action) => {
    const labels = {
      ban: 'Ban User',
      unban: 'Unban User',
      suspend: 'Suspend User',
      unsuspend: 'Unsuspend User',
      make_admin: 'Promote to Admin',
      make_user: 'Demote to User',
    };
    return labels[action] || action;
  };

  const getActionColor = (action) => {
    if (action === 'ban') return 'bg-rose-600 hover:bg-rose-500';
    if (action === 'suspend') return 'bg-amber-600 hover:bg-amber-500';
    return 'gradient-bg';
  };

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald/10 text-emerald-400">
            <HiOutlineUsers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Users</h2>
            <p className="text-sm text-navy-300">{total} registered users</p>
          </div>
        </div>
        <div className="relative max-w-xs w-full">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : users.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <HiOutlineUsers className="w-12 h-12 text-navy-500 mx-auto mb-3" />
          <p className="text-navy-300">No users found.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                          {(user.full_name || user.email || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">{user.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-navy-200">{user.email}</span>
                    </td>
                    <td className="px-5 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-5 py-4">{getStatusBadge(user)}</td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-navy-300">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {user.is_suspended ? (
                          <button
                            onClick={() => setActionModal({ user, action: 'unsuspend' })}
                            className="p-2 rounded-lg hover:bg-white/10 text-emerald-400 transition-colors"
                            title="Unsuspend"
                          >
                            <HiOutlinePlayCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setActionModal({ user, action: 'suspend' })}
                            className="p-2 rounded-lg hover:bg-amber/10 text-amber-400 transition-colors"
                            title="Suspend"
                          >
                            <HiOutlinePauseCircle className="w-4 h-4" />
                          </button>
                        )}
                        {user.is_banned ? (
                          <button
                            onClick={() => setActionModal({ user, action: 'unban' })}
                            className="p-2 rounded-lg hover:bg-white/10 text-emerald-400 transition-colors"
                            title="Unban"
                          >
                            <HiOutlinePlayCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setActionModal({ user, action: 'ban' })}
                            className="p-2 rounded-lg hover:bg-rose/10 text-rose-400 transition-colors"
                            title="Ban"
                          >
                            <HiOutlineNoSymbol className="w-4 h-4" />
                          </button>
                        )}
                        {user.role === 'admin' ? (
                          <button
                            onClick={() => setActionModal({ user, action: 'make_user' })}
                            className="p-2 rounded-lg hover:bg-white/10 text-navy-300 transition-colors"
                            title="Demote to User"
                          >
                            <HiOutlineShieldCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setActionModal({ user, action: 'make_admin' })}
                            className="p-2 rounded-lg hover:bg-accent/10 text-accent-400 transition-colors"
                            title="Promote to Admin"
                          >
                            <HiOutlineShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
              <p className="text-sm text-navy-300">Page {page} of {totalPages}</p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
                >
                  <HiOutlineChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
                >
                  <HiOutlineChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {actionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setActionModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-sm border border-white/10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-amber/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <HiOutlineExclamationTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {getActionLabel(actionModal.action)}
              </h3>
              <p className="text-sm text-navy-300 mb-1">
                Are you sure you want to {getActionLabel(actionModal.action).toLowerCase()}?
              </p>
              <p className="text-sm text-white font-medium mb-6">
                {actionModal.user.full_name || actionModal.user.email}
              </p>
              <div className="flex justify-center space-x-3">
                <button onClick={() => setActionModal(null)} className="btn-secondary py-2 px-5 text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={updateMutation.isPending}
                  className={`px-5 py-2 rounded-xl font-semibold text-white transition-colors text-sm disabled:opacity-50 ${getActionColor(actionModal.action)}`}
                >
                  {updateMutation.isPending ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
