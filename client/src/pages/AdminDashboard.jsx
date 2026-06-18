import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSquares2X2,
  HiOutlineNewspaper,
  HiOutlineUsers,
  HiOutlineFlag,
  HiOutlineGlobeAlt,
  HiOutlineBellAlert,
  HiOutlineChartBarSquare,
  HiOutlineShieldCheck,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineArrowTrendingUp,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import api from '../config/api';
import Spinner from '../components/ui/Spinner';

// Admin sub-page components
import AdminArticles from './admin/AdminArticles';
import AdminUsers from './admin/AdminUsers';
import AdminFlagged from './admin/AdminFlagged';
import AdminSources from './admin/AdminSources';
import AdminNotifications from './admin/AdminNotifications';

const TABS = [
  { id: 'overview',       label: 'Overview',       icon: HiOutlineSquares2X2 },
  { id: 'articles',       label: 'Articles',       icon: HiOutlineNewspaper },
  { id: 'users',          label: 'Users',          icon: HiOutlineUsers },
  { id: 'flagged',        label: 'Flagged',        icon: HiOutlineFlag },
  { id: 'sources',        label: 'Sources',        icon: HiOutlineGlobeAlt },
  { id: 'notifications',  label: 'Notifications',  icon: HiOutlineBellAlert },
  { id: 'analytics',      label: 'Analytics',      icon: HiOutlineChartBarSquare },
];

/* ──────────── Stat Card (kept from original) ──────────── */
function StatCard({ title, value, icon: Icon, color = 'text-accent-400', trend }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="glass p-5 rounded-2xl">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="flex items-center text-xs font-medium text-emerald-400">
            <HiOutlineArrowTrendingUp className="w-3.5 h-3.5 mr-0.5" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white mt-3">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm text-navy-300 mt-1">{title}</p>
    </motion.div>
  );
}

/* ──────────── Overview Section ──────────── */
function OverviewSection({ stats, loading }) {
  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  const verdictDist = stats?.verdictDistribution || {};
  const topSources = stats?.topSources || [];

  return (
    <div>
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={HiOutlineUsers}
          color="text-accent-400"
        />
        <StatCard
          title="Total Articles"
          value={stats?.totalArticles || 0}
          icon={HiOutlineNewspaper}
          color="text-emerald-400"
        />
        <StatCard
          title="Verifications"
          value={stats?.totalVerifications || 0}
          icon={HiOutlineShieldCheck}
          color="text-accent-400"
        />
        <StatCard
          title="Flagged Reports"
          value={stats?.totalFlagged || 0}
          icon={HiOutlineExclamationTriangle}
          color="text-rose-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verdict Summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <HiOutlineShieldCheck className="w-5 h-5 text-accent-400" />
            <span>Verdict Breakdown</span>
          </h3>
          <div className="space-y-4">
            {Object.entries(verdictDist).length > 0 ? (
              Object.entries(verdictDist).map(([verdict, count]) => {
                const total = Object.values(verdictDist).reduce((a, b) => a + b, 0);
                const pct = total ? ((count / total) * 100).toFixed(1) : 0;
                const color =
                  verdict === 'CREDIBLE' ? 'bg-emerald-400' :
                  verdict === 'UNCERTAIN' ? 'bg-amber-400' : 'bg-rose-400';
                const textColor =
                  verdict === 'CREDIBLE' ? 'text-emerald-400' :
                  verdict === 'UNCERTAIN' ? 'text-amber-400' : 'text-rose-400';
                return (
                  <div key={verdict}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-medium ${textColor}`}>{verdict}</span>
                      <span className="text-sm text-navy-300">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${color}`}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-navy-400 text-sm text-center py-6">No verdict data yet.</p>
            )}
          </div>
        </motion.div>

        {/* Top Sources */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <HiOutlineGlobeAlt className="w-5 h-5 text-accent-400" />
            <span>Top Sources</span>
          </h3>
          {topSources.length > 0 ? (
            <div className="space-y-3">
              {topSources.slice(0, 6).map((source, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-navy-300">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-white">{source.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          source.credibility_score > 65 ? 'bg-emerald-400' :
                          source.credibility_score >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${source.credibility_score || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-navy-200 w-8 text-right">
                      {source.credibility_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-navy-400 text-sm text-center py-6">No source data yet.</p>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <HiOutlineChartBarSquare className="w-5 h-5 text-accent-400" />
            <span>Platform Summary</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <p className="text-2xl font-bold gradient-text">
                {stats?.votes?.upvotes || 0}
              </p>
              <p className="text-xs text-navy-400 mt-1">Community Upvotes</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <p className="text-2xl font-bold text-rose-400">
                {stats?.votes?.downvotes || 0}
              </p>
              <p className="text-xs text-navy-400 mt-1">Community Downvotes</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <p className="text-2xl font-bold text-accent-400">
                {stats?.topicDistribution ? Object.keys(stats.topicDistribution).length : 0}
              </p>
              <p className="text-xs text-navy-400 mt-1">Topics Covered</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {topSources.length}
              </p>
              <p className="text-xs text-navy-400 mt-1">Tracked Sources</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ──────────── Analytics Embed (inline lightweight version) ──────────── */
function AnalyticsSection() {
  // Lazy-load full analytics within the admin panel
  const [AnalyticsPage, setAnalyticsPage] = useState(null);

  useEffect(() => {
    import('./Analytics').then((mod) => setAnalyticsPage(() => mod.default));
  }, []);

  if (!AnalyticsPage) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return <AnalyticsPage />;
}

/* ──────────── Main Admin Dashboard ──────────── */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/analytics');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':       return <OverviewSection stats={stats} loading={loading} />;
      case 'articles':       return <AdminArticles />;
      case 'users':          return <AdminUsers />;
      case 'flagged':        return <AdminFlagged />;
      case 'sources':        return <AdminSources />;
      case 'notifications':  return <AdminNotifications />;
      case 'analytics':      return <AnalyticsSection />;
      default:               return <OverviewSection stats={stats} loading={loading} />;
    }
  };

  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="max-w-[1440px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl gradient-bg shadow-lg shadow-accent/20">
            <HiOutlineShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-navy-300">Manage TruthLens platform</p>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl glass text-white"
        >
          {mobileMenuOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineBars3 className="w-6 h-6" />}
        </button>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── Sidebar (Desktop) ─── */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block w-56 flex-shrink-0"
        >
          <nav className="glass rounded-2xl p-3 sticky top-24 space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'text-navy-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-accent-400' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'flagged' && stats?.totalFlagged > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose/20 text-rose-400">
                      {stats.totalFlagged}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </motion.aside>

        {/* ─── Mobile Navigation ─── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <nav className="glass rounded-2xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                      className={`flex flex-col items-center space-y-1.5 px-3 py-3 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-navy-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-accent-400' : ''}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Content Area ─── */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mb-4 text-sm">
            <span className="text-navy-400">Admin</span>
            <span className="text-navy-600">/</span>
            <span className="text-white font-medium">{currentTab?.label}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
