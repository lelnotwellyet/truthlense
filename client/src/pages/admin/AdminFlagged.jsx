import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineFlag,
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlineXCircle,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';

const VERDICT_OPTIONS = ['CREDIBLE', 'UNCERTAIN', 'FLAGGED'];

function getVerdictColor(verdict) {
  switch (verdict?.toUpperCase()) {
    case 'CREDIBLE': return 'badge-credible';
    case 'UNCERTAIN': return 'badge-uncertain';
    case 'FLAGGED': return 'badge-misleading';
    default: return 'badge-uncertain';
  }
}

export default function AdminFlagged() {
  const queryClient = useQueryClient();
  const [overrideModal, setOverrideModal] = useState(null);
  const [dismissModal, setDismissModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: async () => {
      const { data } = await api.get('/admin/disputes');
      return data;
    },
  });

  const overrideMutation = useMutation({
    mutationFn: ({ id, verdict, composite_score }) =>
      api.put(`/admin/reports/${id}/override`, { verdict, composite_score }),
    onSuccess: () => {
      toast.success('Verdict overridden successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      setOverrideModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to override verdict'),
  });

  const approveMutation = useMutation({
    mutationFn: (id) =>
      api.put(`/admin/reports/${id}/override`, { verdict: 'CREDIBLE', composite_score: 80 }),
    onSuccess: () => {
      toast.success('Report approved and restored');
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to approve report'),
  });

  const dismissMutation = useMutation({
    mutationFn: (id) =>
      api.put(`/admin/reports/${id}/override`, { verdict: 'FLAGGED', composite_score: 10 }),
    onSuccess: () => {
      toast.success('Report dismissed');
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      setDismissModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to dismiss report'),
  });

  const reports = data?.reports || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2.5 rounded-xl bg-rose/10 text-rose-400">
          <HiOutlineFlag className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Flagged & Disputes</h2>
          <p className="text-sm text-navy-300">{reports.length} reports requiring review</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : reports.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <HiOutlineCheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-navy-300 text-lg font-medium">All clear!</p>
          <p className="text-navy-400 text-sm mt-1">No flagged or disputed reports to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 hover:bg-white/[0.07] transition-colors"
            >
              {/* Report header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-white line-clamp-2 flex-1 mr-3">
                  {report.title || report.content?.slice(0, 80) || 'Untitled Report'}
                </h3>
                <span className={getVerdictColor(report.verdict)}>
                  {report.verdict || 'UNKNOWN'}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                {report.content && (
                  <p className="text-xs text-navy-300 line-clamp-2">{report.content}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-navy-400">
                  <span>
                    Score: <span className="text-white font-medium">{report.composite_score ?? 'N/A'}</span>
                  </span>
                  {report.reason && (
                    <span className="flex items-center">
                      <HiOutlineExclamationTriangle className="w-3 h-3 mr-1 text-amber-400" />
                      {report.reason}
                    </span>
                  )}
                  {report.created_at && (
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => approveMutation.mutate(report.id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald/10 transition-colors"
                >
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => setOverrideModal({
                    id: report.id,
                    verdict: report.verdict || 'UNCERTAIN',
                    score: report.composite_score || 50,
                  })}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-semibold text-accent-400 hover:bg-accent/10 transition-colors"
                >
                  <HiOutlinePencilSquare className="w-4 h-4" />
                  <span>Override</span>
                </button>
                <button
                  onClick={() => setDismissModal(report.id)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose/10 transition-colors"
                >
                  <HiOutlineXCircle className="w-4 h-4" />
                  <span>Dismiss</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Override Modal */}
      <AnimatePresence>
        {overrideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setOverrideModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-md border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Override Verdict</h3>
                <button onClick={() => setOverrideModal(null)} className="p-1 rounded-lg hover:bg-white/10 text-navy-300">
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-200 mb-2">Verdict</label>
                  <select
                    value={overrideModal.verdict}
                    onChange={(e) => setOverrideModal({ ...overrideModal, verdict: e.target.value })}
                    className="input-field"
                  >
                    {VERDICT_OPTIONS.map((v) => (
                      <option key={v} value={v} className="bg-navy-800">{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-200 mb-2">
                    Composite Score ({overrideModal.score})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overrideModal.score}
                    onChange={(e) => setOverrideModal({ ...overrideModal, score: Number(e.target.value) })}
                    className="w-full accent-accent-400"
                  />
                  <div className="flex justify-between text-xs text-navy-400 mt-1">
                    <span>0 — Flagged</span>
                    <span>100 — Credible</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setOverrideModal(null)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
                <button
                  onClick={() => overrideMutation.mutate({
                    id: overrideModal.id,
                    verdict: overrideModal.verdict,
                    composite_score: overrideModal.score,
                  })}
                  disabled={overrideMutation.isPending}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  {overrideMutation.isPending ? 'Saving...' : 'Save Override'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dismiss Confirmation Modal */}
      <AnimatePresence>
        {dismissModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setDismissModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-sm border border-white/10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <HiOutlineExclamationTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dismiss Report?</h3>
              <p className="text-sm text-navy-300 mb-6">
                This will mark the report as flagged and dismiss the dispute.
              </p>
              <div className="flex justify-center space-x-3">
                <button onClick={() => setDismissModal(null)} className="btn-secondary py-2 px-5 text-sm">Cancel</button>
                <button
                  onClick={() => dismissMutation.mutate(dismissModal)}
                  disabled={dismissMutation.isPending}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors text-sm disabled:opacity-50"
                >
                  {dismissMutation.isPending ? 'Dismissing...' : 'Dismiss'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
