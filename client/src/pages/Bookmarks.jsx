import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBookmarks, useRemoveBookmark } from '../hooks/useBookmarks';
import { formatDate } from '../utils/formatters';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';

export default function Bookmarks() {
  const [activeTab, setActiveTab] = useState('articles');
  const { data: bookmarks, isLoading } = useBookmarks();
  const removeBookmark = useRemoveBookmark();

  if (isLoading) {
    return <div className="flex justify-center items-center h-[60vh]"><Spinner size="lg" /></div>;
  }

  const articles = bookmarks?.filter(b => b.type === 'article') || [];
  const reports = bookmarks?.filter(b => b.type === 'report') || [];

  const handleRemove = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    removeBookmark.mutate(id);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Saved Content</h1>
          <p className="text-navy-200">Your bookmarked articles and verification reports.</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'articles' ? 'bg-white/10 text-white' : 'text-navy-300 hover:text-white'
          }`}
        >
          Articles ({articles.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'reports' ? 'bg-white/10 text-white' : 'text-navy-300 hover:text-white'
          }`}
        >
          Verification Reports ({reports.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeTab === 'articles' ? (
            articles.length === 0 ? (
              <EmptyState message="You haven't saved any articles yet." link="/dashboard" linkText="Browse News" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((item) => (
                  <BookmarkCard 
                    key={item.id} 
                    item={item} 
                    to={`/article/${item.article_id}`} 
                    onRemove={(e) => handleRemove(item.id, e)} 
                  />
                ))}
              </div>
            )
          ) : (
            reports.length === 0 ? (
              <EmptyState message="You haven't saved any verification reports yet." link="/verify" linkText="Verify Content" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((item) => (
                  <BookmarkCard 
                    key={item.id} 
                    item={item} 
                    to={`/report/${item.report_id}`} 
                    onRemove={(e) => handleRemove(item.id, e)} 
                  />
                ))}
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function BookmarkCard({ item, to, onRemove }) {
  const isArticle = item.type === 'article';
  const data = isArticle ? item.article : item.report;
  
  if (!data) return null;

  return (
    <Link to={to} className="glass p-5 flex flex-col h-full hover:bg-white/5 transition-colors group relative overflow-hidden rounded-2xl">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={onRemove}
          className="p-1.5 bg-navy-900/80 rounded-full text-navy-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors backdrop-blur-sm"
          title="Remove bookmark"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {isArticle ? (
        <>
          <div className="flex justify-between items-start mb-3 pr-8">
            <Badge variant="topic">{data.topic}</Badge>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-accent-400 transition-colors">
            {data.title}
          </h3>
          <p className="text-sm text-navy-200 line-clamp-2 mb-4 flex-grow">{data.description}</p>
          <div className="flex justify-between items-center text-xs text-navy-300 mt-auto pt-4 border-t border-white/5">
            <span className="font-semibold text-navy-100">{data.source_name}</span>
            <span>{formatDate(data.published_at)}</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-start mb-4 pr-8">
            <Badge variant={data.verdict === 'Highly Credible' ? 'credible' : data.verdict === 'Uncertain' ? 'uncertain' : 'misleading'}>
              {data.verdict}
            </Badge>
            <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
              Score: {Math.round(data.composite_score)}%
            </span>
          </div>
          <p className="text-sm text-navy-200 line-clamp-3 mb-4 flex-grow">
            {data.submission?.content || "Verified URL content."}
          </p>
          <div className="flex justify-between items-center text-xs text-navy-300 mt-auto pt-4 border-t border-white/5">
            <span className="font-semibold text-navy-100 flex items-center">
              <svg className="w-4 h-4 mr-1 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              AI Verified
            </span>
            <span>{formatDate(data.created_at)}</span>
          </div>
        </>
      )}
    </Link>
  );
}

function EmptyState({ message, link, linkText }) {
  return (
    <div className="text-center py-20 glass rounded-3xl">
      <svg className="mx-auto h-12 w-12 text-navy-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      <h3 className="text-xl font-medium text-white mb-2">{message}</h3>
      <Link to={link} className="text-accent-400 hover:text-white font-medium transition-colors">
        {linkText} →
      </Link>
    </div>
  );
}
