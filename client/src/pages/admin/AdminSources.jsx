import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineGlobeAlt,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineCheckBadge,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../config/api';
import Spinner from '../../components/ui/Spinner';

const CATEGORIES = ['mainstream', 'independent', 'government', 'blog', 'satire', 'academic', 'other'];

const emptySource = { name: '', domain: '', credibility_score: 50, category: 'mainstream' };

function getScoreColor(score) {
  const num = Number(score);
  if (num > 65) return 'text-emerald-400';
  if (num >= 40) return 'text-amber-400';
  return 'text-rose-400';
}

export default function AdminSources() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null); // source object
  const [form, setForm] = useState(emptySource);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sources'],
    queryFn: async () => {
      const { data } = await api.get('/sources');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/sources', body),
    onSuccess: () => {
      toast.success('Source added successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
      setAddModal(false);
      setForm(emptySource);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add source'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => api.put(`/sources/${id}`, body),
    onSuccess: () => {
      toast.success('Source updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
      setEditModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update source'),
  });

  const toggleVerified = (source) => {
    updateMutation.mutate({
      id: source.id,
      body: { is_verified: !source.is_verified },
    });
  };

  const allSources = data?.sources || [];
  const sources = search
    ? allSources.filter(
        (s) =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.domain?.toLowerCase().includes(search.toLowerCase())
      )
    : allSources;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-accent/10 text-accent-400">
            <HiOutlineGlobeAlt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">News Sources</h2>
            <p className="text-sm text-navy-300">{allSources.length} sources tracked</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search sources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
          <button
            onClick={() => { setForm(emptySource); setAddModal(true); }}
            className="btn-primary py-2.5 px-4 text-sm flex items-center space-x-2 whitespace-nowrap"
          >
            <HiOutlinePlusCircle className="w-4 h-4" />
            <span>Add Source</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : sources.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <HiOutlineGlobeAlt className="w-12 h-12 text-navy-500 mx-auto mb-3" />
          <p className="text-navy-300">No sources found.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider hidden md:table-cell">Domain</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider">Score</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider">Verified</th>
                  <th className="px-5 py-4 text-xs font-semibold text-navy-300 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source, i) => (
                  <motion.tr
                    key={source.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-white">{source.name}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-navy-300">{source.domain || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              source.credibility_score > 65
                                ? 'bg-emerald-400'
                                : source.credibility_score >= 40
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                            style={{ width: `${source.credibility_score || 0}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold ${getScoreColor(source.credibility_score)}`}>
                          {source.credibility_score ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-navy-200 capitalize">
                        {source.category || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleVerified(source)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          source.is_verified
                            ? 'text-emerald-400 bg-emerald/10'
                            : 'text-navy-500 hover:text-navy-300 hover:bg-white/5'
                        }`}
                        title={source.is_verified ? 'Verified — click to unverify' : 'Not verified — click to verify'}
                      >
                        <HiOutlineCheckBadge className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setEditModal(source)}
                        className="p-2 rounded-lg hover:bg-white/10 text-accent-400 transition-colors"
                        title="Edit source"
                      >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Source Modal */}
      <AnimatePresence>
        {addModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-md border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Add New Source</h3>
                <button onClick={() => setAddModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-navy-300">
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-200 mb-2">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Reuters"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-200 mb-2">Domain</label>
                  <input
                    type="text"
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    placeholder="e.g. reuters.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-200 mb-2">
                    Credibility Score ({form.credibility_score})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.credibility_score}
                    onChange={(e) => setForm({ ...form, credibility_score: Number(e.target.value) })}
                    className="w-full accent-accent-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-200 mb-2">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-field"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-navy-800 capitalize">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setAddModal(false)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
                <button
                  onClick={() => createMutation.mutate(form)}
                  disabled={createMutation.isPending || !form.name || !form.domain}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add Source'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Source Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setEditModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-md border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Edit {editModal.name}</h3>
                <button onClick={() => setEditModal(null)} className="p-1 rounded-lg hover:bg-white/10 text-navy-300">
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-200 mb-2">
                    Credibility Score ({editModal.credibility_score})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editModal.credibility_score || 50}
                    onChange={(e) => setEditModal({ ...editModal, credibility_score: Number(e.target.value) })}
                    className="w-full accent-accent-400"
                  />
                  <div className="flex justify-between text-xs text-navy-400 mt-1">
                    <span>0 — Unreliable</span>
                    <span>100 — Highly Credible</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-sm text-navy-200">Verified Status</span>
                  <button
                    onClick={() => setEditModal({ ...editModal, is_verified: !editModal.is_verified })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      editModal.is_verified ? 'bg-emerald-500' : 'bg-navy-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        editModal.is_verified ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setEditModal(null)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
                <button
                  onClick={() =>
                    updateMutation.mutate({
                      id: editModal.id,
                      body: {
                        credibility_score: editModal.credibility_score,
                        is_verified: editModal.is_verified,
                      },
                    })
                  }
                  disabled={updateMutation.isPending}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
