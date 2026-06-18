import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineNewspaper,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';

const VERDICT_OPTIONS = ['CREDIBLE', 'UNCERTAIN', 'FLAGGED'];

function getScoreBadge(score) {
  if (score == null) return <span className="text-navy-400 text-sm">N/A</span>;
  const num = Number(score);
  if (num > 65) return <span className="badge-credible">{num}</span>;
  if (num >= 40) return <span className="badge-uncertain">{num}</span>;
  return <span className="badge-misleading">{num}</span>;
}

export default function AdminArticles() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [overrideModal, setOverrideModal] = useState(null); // { id, verdict, score }
  const [deleteModal, setDeleteModal] = useState(null); // article id

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', page, search],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (search) params.topic = search;
      const { data } = await api.get('/admin/articles', { params });
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/articles/${id}`),
    onSuccess: () => {
      toast.success('Article deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setDeleteModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete article'),
  });

  const overrideMutation = useMutation({
    mutationFn: ({ id, verdict, composite_score }) =>
      api.put(`/admin/reports/${id}/override`, { verdict, composite_score }),
    onSuccess: () => {
      toast.success('Verdict overridden successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setOverrideModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to override verdict'),
  });

  const articles = data?.articles || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-accent/10 text-accent-400">
            <HiOutlineNewspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Articles</h2>
            <p className="text-sm text-navy-300">{total} total articles</p>
          </div>
        </div>
        <div className="relative max-w-xs w-full">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
          <input
            type="text"
            placeholder="Filter by topic..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : articles.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <HiOutlineNewspaper className="w-12 h-12 text-navy-500 mx-auto mb-3" />
          <p className="text-navy-300">No articles found.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider hidden md:table-cell">Source</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider hidden lg:table-cell">Topic</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider">Score</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider hidden lg:table-cell">Published</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, i) => (
                  <motion.tr
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white line-clamp-1 max-w-[240px]">{article.title}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-navy-200">{article.source_name || '—'}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-navy-200 capitalize">
                        {article.topic || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">{getScoreBadge(article.composite_score)}</td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-navy-300">
                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setOverrideModal({
                            id: article.report_id || article.id,
                            verdict: article.verdict || 'UNCERTAIN',
                            score: article.composite_score || 50,
                          })}
                          className="p-2 rounded-lg hover:bg-white/10 text-accent-400 transition-colors"
                          title="Override verdict"
                        >
                          <HiOutlinePencilSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(article.id)}
                          className="p-2 rounded-lg hover:bg-rose/10 text-rose-400 transition-colors"
                          title="Delete article"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
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
              <p className="text-sm text-navy-300">
                Page {page} of {totalPages}
              </p>
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
                <button onClick={() => setOverrideModal(null)} className="btn-secondary py-2 px-4 text-sm">
                  Cancel
                </button>
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setDeleteModal(null)}
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
              <h3 className="text-lg font-bold text-white mb-2">Delete Article?</h3>
              <p className="text-sm text-navy-300 mb-6">
                This action is permanent and cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button onClick={() => setDeleteModal(null)} className="btn-secondary py-2 px-5 text-sm">Cancel</button>
                <button
                  onClick={() => deleteMutation.mutate(deleteModal)}
                  disabled={deleteMutation.isPending}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors text-sm disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
