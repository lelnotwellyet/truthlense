import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useVerifyText, useVerifyUrl, useVerifyImage } from '../hooks/useVerify';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import CredibilityGauge from '../components/verify/CredibilityGauge';
import ScoreBreakdown from '../components/verify/ScoreBreakdown';
import EvidencePanel from '../components/verify/EvidencePanel';
import toast from 'react-hot-toast';

export default function VerifyContent() {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  
  const navigate = useNavigate();
  
  const verifyTextMutation = useVerifyText();
  const verifyUrlMutation = useVerifyUrl();
  const verifyImageMutation = useVerifyImage();
  
  const isLoading = verifyTextMutation.isPending || verifyUrlMutation.isPending || verifyImageMutation.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    
    try {
      let data;
      if (activeTab === 'text') {
        if (!text || text.length < 10) return toast.error('Please enter at least 10 characters');
        data = await verifyTextMutation.mutateAsync({ text, source_name: sourceName });
      } else if (activeTab === 'url') {
        if (!url) return toast.error('Please enter a URL');
        data = await verifyUrlMutation.mutateAsync({ url });
      } else if (activeTab === 'image') {
        if (!file) return toast.error('Please select an image');
        data = await verifyImageMutation.mutateAsync(file);
      }
      
      setResult(data);
      toast.success('Verification complete');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed');
    }
  };

  const tabs = [
    { id: 'text', label: 'Text/Claim', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'url', label: 'Article URL', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { id: 'image', label: 'Image OCR', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-4">Verify News Credibility</h1>
        <p className="text-navy-200">Submit an article, claim, or image to our AI engine for a comprehensive fact-check analysis.</p>
      </div>

      <div className="glass p-1 mb-8 rounded-2xl flex max-w-md mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(null); }}
            className={`flex-1 flex justify-center items-center py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-navy-800 text-white shadow-lg' : 'text-navy-300 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'text' && (
              <motion.div
                key="text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-navy-200 mb-2">Text or Claim</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                    placeholder="Paste the article text or claim here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <Input
                  label="Source Name (Optional)"
                  placeholder="e.g., The New York Times, bbc.com"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                />
              </motion.div>
            )}

            {activeTab === 'url' && (
              <motion.div
                key="url"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Input
                  label="Article URL"
                  type="url"
                  placeholder="https://example.com/news-article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <p className="mt-2 text-xs text-navy-300">We will extract the text from the webpage automatically.</p>
              </motion.div>
            )}

            {activeTab === 'image' && (
              <motion.div
                key="image"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <label className="block text-sm font-medium text-navy-200 mb-2">Upload Image</label>
                <div className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <svg className="mx-auto h-12 w-12 text-navy-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {file ? (
                    <p className="text-accent-400 font-medium">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-navy-300 text-sm">PNG, JPG, WEBP up to 10MB</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={isLoading} className="w-full sm:w-auto">
              Analyze Content
            </Button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
              {result.report && (
                <button 
                  onClick={() => navigate(`/report/${result.report.id}`)}
                  className="text-sm font-semibold text-accent-400 hover:text-white transition-colors"
                >
                  View Full Report →
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-8 flex items-center justify-center">
                <CredibilityGauge 
                  score={result.report?.composite_score || result.ml_result?.composite?.composite_score || 50} 
                  verdict={result.report?.verdict || result.ml_result?.composite?.verdict || 'Uncertain'} 
                />
              </div>
              <div className="glass p-8 flex flex-col justify-center">
                <ScoreBreakdown 
                  mlScore={result.ml_result?.composite?.breakdown?.ml_score || 50}
                  sourceScore={result.ml_result?.composite?.breakdown?.source_score || 50}
                  factCheckScore={result.ml_result?.composite?.breakdown?.fact_check_score || 50}
                />
              </div>
            </div>

            <EvidencePanel evidence={result.ml_result?.fact_check?.evidence || []} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
