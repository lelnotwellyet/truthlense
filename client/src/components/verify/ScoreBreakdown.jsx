import { motion } from 'framer-motion';
import { getScoreColor } from '../../utils/formatters';

function ProgressBar({ label, score, weight }) {
  const color = getScoreColor(score);
  
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-navy-200">
          {label} <span className="text-navy-400 text-xs ml-1">({weight})</span>
        </span>
        <span className="text-sm font-bold text-white">{Math.round(score)}%</span>
      </div>
      <div className="h-2.5 w-full bg-navy-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        />
      </div>
    </div>
  );
}

export default function ScoreBreakdown({ mlScore = 50, sourceScore = 50, factCheckScore = 50 }) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
        Score Breakdown
      </h3>
      <ProgressBar label="AI Model Analysis" score={mlScore} weight="40%" />
      <ProgressBar label="Source Credibility" score={sourceScore} weight="40%" />
      <ProgressBar label="Fact-Check Cross-reference" score={factCheckScore} weight="20%" />
    </div>
  );
}
