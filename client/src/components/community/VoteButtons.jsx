import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../config/api';
import toast from 'react-hot-toast';

export default function VoteButtons({ reportId, initialVotes }) {
  const [votes, setVotes] = useState(initialVotes || { up: 0, down: 0, total: 0 });
  const [userVote, setUserVote] = useState(null); // 'up' or 'down'

  useEffect(() => {
    // If we wanted to fetch the user's specific vote on mount we could, 
    // but for now we'll just track it after they vote in this session
  }, [reportId]);

  const handleVote = async (type) => {
    try {
      if (userVote === type) {
        // Remove vote
        await api.delete(`/votes/${reportId}`);
        setVotes(prev => ({
          ...prev,
          [type]: prev[type] - 1,
          total: prev.total - 1
        }));
        setUserVote(null);
        return;
      }

      // Cast or change vote
      const { data } = await api.post('/votes', { report_id: reportId, vote_type: type });
      setVotes(data.stats);
      setUserVote(type);
      toast.success('Vote recorded');
    } catch (err) {
      toast.error('Failed to record vote');
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleVote('up')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
          userVote === 'up'
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
            : 'bg-white/5 border-white/10 text-navy-200 hover:text-white hover:bg-white/10'
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span className="font-semibold">{votes.up}</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleVote('down')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
          userVote === 'down'
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
            : 'bg-white/5 border-white/10 text-navy-200 hover:text-white hover:bg-white/10'
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
        </svg>
        <span className="font-semibold">{votes.down}</span>
      </motion.button>
    </div>
  );
}
