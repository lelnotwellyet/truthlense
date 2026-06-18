import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EvidencePanel({ evidence = [] }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="w-full mt-6 bg-navy-800/50 rounded-xl border border-white/5 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-semibold text-white">Fact-Check Evidence Found</span>
          <span className="bg-accent-500/20 text-accent-400 px-2 py-0.5 rounded text-xs font-bold ml-2">
            {evidence.length}
          </span>
        </div>
        <svg 
          className={`w-5 h-5 text-navy-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 space-y-4">
              {evidence.map((item, idx) => (
                <div key={idx} className="bg-navy-900/50 p-4 rounded-lg border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-white text-sm">{item.publisher}</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-white/10 text-navy-200">
                      Rated: <span className="text-white">{item.rating}</span>
                    </span>
                  </div>
                  {item.url && (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-accent-400 hover:text-accent-300 transition-colors inline-flex items-center"
                    >
                      Read full fact-check report
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
