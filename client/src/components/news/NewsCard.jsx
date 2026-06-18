import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate, truncateText } from '../../utils/formatters';
import Badge from '../ui/Badge';

export default function NewsCard({ article }) {
  const credibilityScore = article.credibility_score;
  let verdict = 'Uncertain';
  if (credibilityScore >= 80) verdict = 'Highly Credible';
  else if (credibilityScore >= 60) verdict = 'Likely Credible';
  else if (credibilityScore >= 40) verdict = 'Uncertain';
  else if (credibilityScore !== null) verdict = 'Potentially Misleading';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-hover overflow-hidden flex flex-col h-full"
    >
      <Link to={`/article/${article.id}`} className="block relative h-48 overflow-hidden bg-navy-800">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxZTI5M2IiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzQ3NTU2OSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBpbWFnZTwvdGV4dD48L3N2Zz4=';
            }}
          />
        ) : (
          <div className="w-full h-full gradient-bg opacity-50 flex items-center justify-center">
            <span className="text-white/50 text-sm">No image available</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          {credibilityScore !== null && <Badge variant={verdict}>{formatScore(credibilityScore)}</Badge>}
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <Badge variant="topic">{article.topic || 'General'}</Badge>
          <span className="text-xs text-navy-300 font-medium">
            {formatDate(article.published_at)}
          </span>
        </div>
        
        <Link to={`/article/${article.id}`} className="group">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-accent-400 transition-colors">
            {article.title}
          </h3>
        </Link>
        
        <p className="text-sm text-navy-200 mb-4 flex-grow line-clamp-3">
          {truncateText(article.description || article.content, 120)}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
          <span className="text-sm font-medium text-navy-100 truncate pr-2">
            {article.source_name || 'Unknown Source'}
          </span>
          <Link 
            to={`/article/${article.id}`} 
            className="text-accent-400 text-sm font-semibold hover:text-accent-300 transition-colors flex-shrink-0"
          >
            Read more →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function formatScore(score) {
  return `${Math.round(score)}%`;
}
