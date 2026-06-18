import { motion } from 'framer-motion';
import { getScoreColor, getVerdictColor } from '../../utils/formatters';

export default function CredibilityGauge({ score, verdict, size = 'lg' }) {
  const radius = size === 'lg' ? 80 : 60;
  const strokeWidth = size === 'lg' ? 16 : 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const color = getScoreColor(score);
  const verdictColor = getVerdictColor(verdict);
  
  const dims = size === 'lg' ? 'w-48 h-48' : 'w-36 h-36';
  const textScore = size === 'lg' ? 'text-5xl' : 'text-4xl';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${dims} flex items-center justify-center`}>
        {/* Background Circle */}
        <svg
          height={radius * 2}
          width={radius * 2}
          className="absolute transform -rotate-90"
        >
          <circle
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Circle */}
          <motion.circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset: circumference }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`${textScore} font-bold text-white tracking-tighter`}
          >
            {Math.round(score)}<span className="text-xl text-navy-300">%</span>
          </motion.span>
        </div>
      </div>
      
      {verdict && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className={`mt-4 font-semibold text-lg ${verdictColor}`}
        >
          {verdict}
        </motion.div>
      )}
    </div>
  );
}
