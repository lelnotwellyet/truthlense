import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiShieldCheck,
  HiUserGroup,
  HiHandThumbUp,
  HiHandThumbDown,
  HiArrowRight,
} from 'react-icons/hi2';
import { useReports } from '../hooks/useVerify';
import { formatDate, truncateText, formatScore } from '../utils/formatters';
import Spinner from '../components/ui/Spinner';

const VERDICT_STYLES = {
  'Highly Credible': {
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    dot: 'bg-emerald-400',
    label: 'Highly Credible',
  },
  'Likely Credible': {
    badge: 'bg-accent/20 text-accent-400 border border-accent/30',
    dot: 'bg-accent-400',
    label: 'Likely Credible',
  },
  'Uncertain': {
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    dot: 'bg-amber-400',
    label: 'Uncertain',
  },
  'Potentially Misleading': {
    badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    dot: 'bg-rose-400',
    label: 'Potentially Misleading',
  },
  // Legacy fallbacks
  CREDIBLE: {
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    dot: 'bg-emerald-400',
    label: 'Credible',
  },
  UNCERTAIN: {
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    dot: 'bg-amber-400',
    label: 'Uncertain',
  },
  FLAGGED: {
    badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    dot: 'bg-rose-400',
    label: 'Flagged',
  },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Community() {
  const { data: reports, isLoading, error } = useReports(true);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white dark:text-white mb-2 flex items-center gap-3"
          >
            <HiUserGroup className="h-8 w-8 text-accent-400" />
            Community Reports
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-navy-200"
          >
            Recent verification submissions from the community.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Link
            to="/verify"
            className="btn-primary flex items-center gap-2 shadow-lg shadow-accent/20"
          >
            <HiShieldCheck className="h-5 w-5" />
            Submit Verification
          </Link>
        </motion.div>
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
          <p className="text-rose-400 font-medium">Failed to load community reports.</p>
          <p className="text-navy-300 text-sm mt-1">Please try again later.</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && (!reports || reports.length === 0) && (
        <div className="glass p-12 text-center">
          <HiUserGroup className="h-16 w-16 text-navy-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No reports yet</h3>
          <p className="text-navy-300 mb-6">Be the first to submit a verification report!</p>
          <Link to="/verify" className="btn-primary inline-flex items-center gap-2">
            <HiShieldCheck className="h-5 w-5" />
            Verify Now
          </Link>
        </div>
      )}

      {/* Reports Grid */}
      {!isLoading && reports && reports.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {reports.map((report) => {
            const verdict = VERDICT_STYLES[report.verdict] || VERDICT_STYLES.UNCERTAIN;
            return (
              <motion.div key={report.id} variants={item}>
                <Link
                  to={`/report/${report.id}`}
                  className="block glass-hover p-6 h-full flex flex-col"
                >
                  {/* Verdict Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${verdict.badge}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${verdict.dot}`} />
                      {verdict.label}
                    </span>
                    <span className="text-xs text-navy-300 font-medium">
                      {formatDate(report.created_at)}
                    </span>
                  </div>

                  {/* Title / Content */}
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-accent-400 transition-colors">
                    {report.title || truncateText(report.content, 80)}
                  </h3>
                  <p className="text-sm text-navy-200 mb-4 flex-grow line-clamp-3">
                    {truncateText(report.content || report.summary, 140)}
                  </p>

                  {/* Score & Votes */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <span className="text-sm font-bold gradient-text">
                      Score: {formatScore(report.composite_score ?? report.score)}
                    </span>
                    <div className="flex items-center gap-3 text-navy-300 text-sm">
                      <span className="flex items-center gap-1">
                        <HiHandThumbUp className="h-4 w-4" />
                        {report.upvotes ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiHandThumbDown className="h-4 w-4" />
                        {report.downvotes ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 gradient-bg rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/icons.svg')] opacity-10 bg-repeat mix-blend-overlay" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Want to help fight misinformation?</h3>
            <p className="text-white/80 text-sm">
              Submit suspicious content for AI-powered verification and help the community stay informed.
            </p>
          </div>
          <Link
            to="/verify"
            className="inline-flex items-center gap-2 bg-white text-navy-900 font-bold px-6 py-3 rounded-xl text-sm hover:shadow-lg transition-all flex-shrink-0"
          >
            Get Started <HiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
