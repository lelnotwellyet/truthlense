import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchNews } from '../hooks/useNews';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import NewsFeed from '../components/news/NewsFeed';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('');
  const [topic, setTopic] = useState('all');
  
  const { data, isLoading } = useSearchNews(
    submittedTerm || topic !== 'all' ? { keyword: submittedTerm, topic: topic === 'all' ? null : topic } : null
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedTerm(searchTerm);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">Search News & Fact-Checks</h1>
        <p className="text-navy-200 mb-8">Find credible news articles across thousands of verified sources.</p>
        
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search keywords, topics, or claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-navy-800/80"
              icon={
                <svg className="w-5 h-5 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <Button type="submit" className="px-8">Search</Button>
        </form>
        
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {['all', 'politics', 'technology', 'business', 'science', 'health'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setTopic(t); setSubmittedTerm(searchTerm); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                topic === t ? 'bg-white/20 text-white' : 'glass text-navy-300 hover:text-white'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-8">
        {(submittedTerm || topic !== 'all') ? (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">
              Search Results {data?.total ? `(${data.total})` : ''}
            </h2>
            <NewsFeed articles={data?.articles} isLoading={isLoading} />
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-navy-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-navy-300 text-lg">Enter a search term above to find news.</p>
          </div>
        )}
      </div>
    </div>
  );
}
