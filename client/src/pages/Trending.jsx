import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiExclamationTriangle,
  HiShieldExclamation,
  HiFire,
} from 'react-icons/hi2';
import { useTrendingNews } from '../hooks/useNews';
import { formatDate, truncateText, formatScore, getScoreColor } from '../utils/formatters';
import Spinner from '../components/ui/Spinner';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Trending() {
  const { data: rawArticles, isLoading, error } = useTrendingNews();

  // Filter to low credibility (< 40) if scores exist, otherwise show all sorted by date
  const articles = rawArticles
    ? [...rawArticles]
        .filter((a) =>
          a.credibility_score !== null && a.credibility_score !== undefined
            ? a.credibility_score < 40
            : true
        )
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    : [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white dark:text-white mb-2 flex items-center gap-3"
        >
          <HiFire className="h-8 w-8 text-rose-400" />
          Trending Misinformation
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-navy-200"
        >
          Articles flagged by our AI as potentially misleading.
        </motion.p>
      </div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-8 rounded-2xl p-5 border border-rose/30 bg-rose/10 backdrop-blur-lg flex items-start gap-4"
      >
        <HiExclamationTriangle className="h-6 w-6 text-rose-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-rose-300 font-semibold text-sm">Caution</p>
          <p className="text-rose-200/80 text-sm">
            These articles have been flagged as potentially misleading by our AI analysis. Always
            verify information from multiple trusted sources before sharing.
          </p>
        </div>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass p-8 text-center">
          <p className="text-rose-400 font-medium">Failed to load articles.</p>
          <p className="text-navy-300 text-sm mt-1">Please try again later.</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && articles.length === 0 && (
        <div className="glass p-12 text-center">
          <HiShieldExclamation className="h-16 w-16 text-navy-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No flagged articles</h3>
          <p className="text-navy-300">Great news — no trending misinformation detected right now.</p>
        </div>
      )}

      {/* Articles Grid */}
      {!isLoading && articles.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {articles.map((article) => {
            const score = article.credibility_score;
            const hasScore = score !== null && score !== undefined;

            return (
              <motion.div key={article.id} variants={item}>
                <Link
                  to={`/article/${article.id}`}
                  className="block glass-hover overflow-hidden h-full flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-navy-800 overflow-hidden">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxZTI5M2IiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzQ3NTU2OSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBpbWFnZTwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-rose-900/40 to-navy-800 flex items-center justify-center">
                        <HiExclamationTriangle className="h-10 w-10 text-rose-500/40" />
                      </div>
                    )}

                    {/* Warning badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose/20 text-rose-400 border border-rose/30 backdrop-blur-sm">
                        <HiExclamationTriangle className="h-3.5 w-3.5" />
                        {hasScore ? formatScore(score) : 'Flagged'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-rose-300 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-navy-200 mb-4 flex-grow line-clamp-3">
                      {truncateText(article.description || article.content, 120)}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                      <span className="text-sm font-medium text-navy-100 truncate pr-2">
                        {article.source_name || 'Unknown Source'}
                      </span>
                      <span className="text-xs text-navy-300 font-medium flex-shrink-0">
                        {formatDate(article.published_at)}
                      </span>
                    </div>

                    {/* Score bar */}
                    {hasScore && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-navy-300">Credibility</span>
                          <span style={{ color: getScoreColor(score) }}>{formatScore(score)}</span>
                        </div>
                        <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: getScoreColor(score) }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
