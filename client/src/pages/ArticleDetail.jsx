import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArticle } from '../hooks/useNews';
import { useAddBookmark, useRemoveBookmark, useBookmarks } from '../hooks/useBookmarks';
import { useVerifyUrl } from '../hooks/useVerify';
import { formatDate, getVerdictBg } from '../utils/formatters';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: article, isLoading, error } = useArticle(id);
  const { data: bookmarks } = useBookmarks();
  
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const verifyUrlMutation = useVerifyUrl();

  if (isLoading) {
    return <div className="flex justify-center items-center h-[60vh]"><Spinner size="lg" /></div>;
  }

  if (error || !article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Article not found</h2>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const isBookmarked = bookmarks?.some(b => b.article_id === id);

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        const bookmark = bookmarks.find(b => b.article_id === id);
        await removeBookmark.mutateAsync(bookmark.id);
        toast.success('Bookmark removed');
      } else {
        await addBookmark.mutateAsync({ type: 'article', article_id: id });
        toast.success('Article bookmarked');
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleVerify = async () => {
    try {
      if (article.url) {
        const data = await verifyUrlMutation.mutateAsync({ url: article.url });
        if (data.report) {
          navigate(`/report/${data.report.id}`);
        } else {
          toast.success('Verification started. Check your dashboard later.');
        }
      } else if (article.content) {
        // If we only have text, we would navigate to verify page with text pre-filled
        // For simplicity, just redirect to verify
        navigate('/verify');
      }
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  let verdict = 'Uncertain';
  if (article.credibility_score >= 80) verdict = 'Highly Credible';
  else if (article.credibility_score >= 60) verdict = 'Likely Credible';
  else if (article.credibility_score !== null) verdict = 'Potentially Misleading';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center text-navy-300 hover:text-white mb-8 transition-colors font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </motion.button>

      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass overflow-hidden rounded-3xl"
      >
        {/* Hero Image */}
        <div className="h-64 sm:h-80 md:h-96 w-full relative bg-navy-800">
          {article.image_url ? (
            <img src={article.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full gradient-bg opacity-30 flex items-center justify-center">
              <svg className="w-24 h-24 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="topic">{article.topic}</Badge>
              {article.credibility_score !== null && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getVerdictBg(verdict)}`}>
                  AI Score: {Math.round(article.credibility_score)}%
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              {article.title}
            </h1>
            <div className="flex items-center text-sm text-navy-200">
              <span className="font-semibold text-white mr-4">{article.source_name || article.sources?.name || 'Unknown Source'}</span>
              <span>{formatDate(article.published_at)}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white/5 border-y border-white/10 px-6 py-4 flex justify-between items-center">
          <button 
            onClick={handleBookmark}
            className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
              isBookmarked ? 'text-accent-400' : 'text-navy-200 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>{isBookmarked ? 'Saved' : 'Save for later'}</span>
          </button>

          <Button 
            onClick={handleVerify} 
            loading={verifyUrlMutation.isPending}
            variant="secondary" 
            className="py-2 text-sm"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Verify this article
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10">
          <div className="prose prose-invert max-w-none text-navy-100 prose-a:text-accent-400 prose-headings:text-white">
            {article.content ? (
              <p className="whitespace-pre-line text-lg leading-relaxed">{article.content}</p>
            ) : (
              <p className="whitespace-pre-line text-lg leading-relaxed">{article.description}</p>
            )}
            
            {article.url && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent-400 font-semibold hover:text-accent-300 transition-colors"
                >
                  Read original article on {article.source_name}
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </motion.article>
    </div>
  );
}
