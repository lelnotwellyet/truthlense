import { motion } from 'framer-motion';
import {
  HiOutlineChartBarSquare,
  HiOutlineArrowTrendingUp,
  HiOutlineHandThumbUp,
  HiOutlineHandThumbDown,
  HiOutlineGlobeAlt,
} from 'react-icons/hi2';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../config/api';
import Spinner from '../components/ui/Spinner';

const VERDICT_COLORS = {
  CREDIBLE: '#34d399',   // emerald-400
  UNCERTAIN: '#fbbf24',  // amber-400
  FLAGGED: '#fb7185',    // rose-400
};

const TOPIC_COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#f472b6', '#38bdf8', '#4ade80'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800/95 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      {label && <p className="text-xs text-navy-300 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      </div>
    );
  }

  // Transform data for charts
  const verdictData = data?.verdictDistribution
    ? Object.entries(data.verdictDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const topicData = data?.topicDistribution
    ? Object.entries(data.topicDistribution)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
        .sort((a, b) => b.value - a.value)
    : [];

  const topSources = data?.topSources || [];

  const votes = data?.votes || {};
  const totalVotes = (votes.upvotes || 0) + (votes.downvotes || 0);
  const voteData = totalVotes > 0
    ? [
        { name: 'Upvotes', value: votes.upvotes || 0 },
        { name: 'Downvotes', value: votes.downvotes || 0 },
      ]
    : [];
  const VOTE_COLORS = ['#34d399', '#fb7185'];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 rounded-xl gradient-bg">
            <HiOutlineChartBarSquare className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-navy-300">Platform-wide verification insights</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total Users', value: data?.totalUsers || 0, icon: '👥' },
          { label: 'Total Articles', value: data?.totalArticles || 0, icon: '📰' },
          { label: 'Verifications', value: data?.totalVerifications || 0, icon: '🛡️' },
          { label: 'Flagged', value: data?.totalFlagged || 0, icon: '🚩' },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-navy-300">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verdict Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <HiOutlineArrowTrendingUp className="w-5 h-5 text-accent-400" />
            <h3 className="text-lg font-semibold text-white">Verdict Distribution</h3>
          </div>
          {verdictData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={verdictData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {verdictData.map((entry) => (
                    <Cell key={entry.name} fill={VERDICT_COLORS[entry.name] || '#60a5fa'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(val) => <span className="text-sm text-navy-200">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-navy-400 text-sm">
              No verdict data available
            </div>
          )}
        </motion.div>

        {/* Community Votes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <HiOutlineHandThumbUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Community Votes</h3>
          </div>
          {voteData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={voteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {voteData.map((_, i) => (
                      <Cell key={i} fill={VOTE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(val) => <span className="text-sm text-navy-200">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-8 mt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1.5 text-emerald-400">
                    <HiOutlineHandThumbUp className="w-5 h-5" />
                    <span className="text-2xl font-bold">{votes.upvotes || 0}</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-0.5">Upvotes</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1.5 text-rose-400">
                    <HiOutlineHandThumbDown className="w-5 h-5" />
                    <span className="text-2xl font-bold">{votes.downvotes || 0}</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-0.5">Downvotes</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-navy-400 text-sm">
              No voting data available
            </div>
          )}
        </motion.div>

        {/* Topic Distribution Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <HiOutlineChartBarSquare className="w-5 h-5 text-accent-400" />
            <h3 className="text-lg font-semibold text-white">Articles by Topic</h3>
          </div>
          {topicData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topicData} layout="horizontal" margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#7680a0', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#7680a0', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Articles" radius={[6, 6, 0, 0]}>
                  {topicData.map((_, i) => (
                    <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-navy-400 text-sm">
              No topic data available
            </div>
          )}
        </motion.div>

        {/* Top Sources Horizontal Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <HiOutlineGlobeAlt className="w-5 h-5 text-accent-400" />
            <h3 className="text-lg font-semibold text-white">Top Sources</h3>
          </div>
          {topSources.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topSources.slice(0, 8)}
                layout="vertical"
                margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  type="number"
                  tick={{ fill: '#7680a0', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#c4c8d6', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="credibility_score" name="Credibility" radius={[0, 6, 6, 0]} fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-navy-400 text-sm">
              No source data available
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
