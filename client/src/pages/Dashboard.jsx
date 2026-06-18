import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiGlobeAlt, HiChevronDown } from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';
import { useNewsFeed, useTrendingNews } from '../hooks/useNews';
import NewsFeed from '../components/news/NewsFeed';
import TopicFilter from '../components/news/TopicFilter';

const TOPICS = [
  { label: 'All News', value: 'all' },
  { label: 'Politics', value: 'politics' },
  { label: 'Technology', value: 'technology' },
  { label: 'Business', value: 'business' },
  { label: 'Science', value: 'science' },
  { label: 'Health', value: 'health' },
  { label: 'Sports', value: 'sports' },
  { label: 'Entertainment', value: 'entertainment' },
];

const REGIONS = [
  { label: 'Global News', value: '', icon: '🌍' },
  { label: 'India News', value: 'in', icon: '🇮🇳' },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const [topic, setTopic] = useState('all');
  const [page, setPage] = useState(1);
  const [region, setRegion] = useState('');
  const [regionOpen, setRegionOpen] = useState(false);
  
  const { data: newsData, isLoading } = useNewsFeed(topic, page, region);
  const { data: trendingNews, isLoading: trendingLoading } = useTrendingNews();

  const handleTopicSelect = (newTopic) => {
    setTopic(newTopic);
    setPage(1);
  };

  const handleRegionSelect = (value) => {
    setRegion(value);
    setPage(1);
    setRegionOpen(false);
  };

  const currentRegion = REGIONS.find(r => r.value === region) || REGIONS[0];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white dark:text-white mb-2"
          >
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
          </motion.h1>
          <p className="text-navy-200">Your personalized, AI-verified news feed.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Region Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRegionOpen(!regionOpen)}
              className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-200"
            >
              <span className="text-lg">{currentRegion.icon}</span>
              <span>{currentRegion.label}</span>
              <HiChevronDown className={`h-4 w-4 transition-transform duration-200 ${regionOpen ? 'rotate-180' : ''}`} />
            </button>
            {regionOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 top-full mt-2 w-48 glass-sm p-2 shadow-2xl z-20 rounded-xl"
              >
                {REGIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => handleRegionSelect(r.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      region === r.value
                        ? 'bg-accent/20 text-accent-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <Link 
            to="/verify" 
            className="btn-primary hidden sm:flex items-center space-x-2 shadow-lg shadow-accent/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verify News</span>
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <TopicFilter topics={TOPICS} selected={topic} onSelect={handleTopicSelect} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Feed */}
        <div className="lg:w-2/3">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
            <span className="text-lg">{currentRegion.icon}</span>
            {topic === 'all' ? `${currentRegion.label}` : `${TOPICS.find(t => t.value === topic)?.label} — ${currentRegion.label}`}
          </h2>
          <NewsFeed articles={newsData?.articles} isLoading={isLoading} />
          
          {newsData?.totalPages > page && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 space-y-8">
          <div className="glass p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Trending & Credible
            </h2>
            
            {trendingLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="w-16 h-16 bg-navy-800 rounded-lg"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-navy-800 rounded w-3/4"></div>
                      <div className="h-4 bg-navy-800 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {trendingNews?.slice(0, 5).map(article => (
                  <Link 
                    key={article.id} 
                    to={`/article/${article.id}`}
                    className="flex space-x-3 group hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
                  >
                    <div className="w-16 h-16 flex-shrink-0 bg-navy-800 rounded-lg overflow-hidden">
                      {article.image_url ? (
                        <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full gradient-bg opacity-50" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-accent-400 line-clamp-2 transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-navy-300 mt-1">{article.source_name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="gradient-bg rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('/icons.svg')] opacity-10 bg-repeat mix-blend-overlay group-hover:opacity-20 transition-opacity"></div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Spotted Fake News?</h3>
            <p className="text-white/80 mb-4 text-sm relative z-10">
              Help the community by submitting suspicious articles for AI verification.
            </p>
            <Link to="/verify" className="inline-block bg-white text-navy-900 font-bold px-4 py-2 rounded-lg text-sm relative z-10 hover:shadow-lg transition-all">
              Verify Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
