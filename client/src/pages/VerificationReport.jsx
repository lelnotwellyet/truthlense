import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReport } from '../hooks/useVerify';
import { useAddBookmark, useRemoveBookmark, useBookmarks } from '../hooks/useBookmarks';
import { formatDate } from '../utils/formatters';
import CredibilityGauge from '../components/verify/CredibilityGauge';
import ScoreBreakdown from '../components/verify/ScoreBreakdown';
import EvidencePanel from '../components/verify/EvidencePanel';
import VoteButtons from '../components/community/VoteButtons';
import CommunityBadge from '../components/community/CommunityBadge';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function VerificationReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useReport(id);
  const { data: bookmarks } = useBookmarks();
  
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  if (isLoading) {
    return <div className="flex justify-center items-center h-[60vh]"><Spinner size="lg" /></div>;
  }

  if (error || !data?.report) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Report not found</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
      </div>
    );
  }

  const { report, votes } = data;
  const isBookmarked = bookmarks?.some(b => b.report_id === id);

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        const bookmark = bookmarks.find(b => b.report_id === id);
        await removeBookmark.mutateAsync(bookmark.id);
        toast.success('Bookmark removed');
      } else {
        await addBookmark.mutateAsync({ type: 'report', report_id: id });
        toast.success('Report saved to bookmarks');
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-navy-300 hover:text-white transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <div className="text-sm text-navy-300">
          Generated on {formatDate(report.created_at)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Analysis Results */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-3xl"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-10">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">Credibility Report</h1>
                <p className="text-navy-200 mb-4">Comprehensive AI and Fact-Check Analysis</p>
                <div className="flex items-center space-x-3">
                  <CommunityBadge upvotes={votes?.up} downvotes={votes?.down} />
                  {report.submission?.source_name && (
                    <span className="text-sm font-medium px-3 py-1 bg-white/5 rounded-md border border-white/10 text-white">
                      Source: {report.submission.source_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <CredibilityGauge score={report.composite_score} verdict={report.verdict} size="lg" />
              </div>
            </div>

            <div className="bg-navy-900/50 rounded-2xl p-6 border border-white/5">
              <ScoreBreakdown 
                mlScore={report.ml_confidence}
                sourceScore={report.source_score}
                factCheckScore={report.fact_check_score}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EvidencePanel evidence={report.evidence} />
          </motion.div>

          {report.submission && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-8 rounded-3xl"
            >
              <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Analyzed Content</h3>
              <div className="prose prose-invert max-w-none text-navy-100 bg-navy-900/50 p-6 rounded-xl border border-white/5">
                <p className="whitespace-pre-line">{report.submission.content}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6 rounded-3xl"
          >
            <h3 className="text-lg font-bold text-white mb-4">Community Feedback</h3>
            <p className="text-sm text-navy-200 mb-6">
              Do you agree with this AI analysis? Your vote helps improve the system.
            </p>
            <div className="flex justify-center border-t border-white/10 pt-6">
              <VoteButtons reportId={id} initialVotes={votes} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-3xl space-y-3"
          >
            <button 
              onClick={handleBookmark}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>{isBookmarked ? 'Remove Bookmark' : 'Save Report'}</span>
            </button>
            <button 
              onClick={handleShare}
              className="w-full glass flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors text-white"
            >
              <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share Link</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
