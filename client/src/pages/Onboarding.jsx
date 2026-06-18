import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiBuildingLibrary,
  HiHeart,
  HiComputerDesktop,
  HiChartBar,
  HiBeaker,
  HiFilm,
  HiTrophy,
  HiCheckCircle,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Button from '../components/ui/Button';

const TOPICS = [
  {
    name: 'Politics',
    icon: HiBuildingLibrary,
    colorClass: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  },
  {
    name: 'Health',
    icon: HiHeart,
    colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    name: 'Technology',
    icon: HiComputerDesktop,
    colorClass: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  },
  {
    name: 'Business',
    icon: HiChartBar,
    colorClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  {
    name: 'Science',
    icon: HiBeaker,
    colorClass: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  },
  {
    name: 'Entertainment',
    icon: HiFilm,
    colorClass: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  },
  {
    name: 'Sports',
    icon: HiTrophy,
    colorClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
];

export default function Onboarding() {
  const { preferences, setPreferences } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(preferences?.topics || []);
  const [isLoading, setIsLoading] = useState(false);

  const toggleTopic = (topic) => {
    setSelected((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSave = async () => {
    if (selected.length < 3 || selected.length > 5) {
      return toast.error('Please select between 3 and 5 topics.');
    }

    try {
      setIsLoading(true);
      const { data } = await api.put('/profile/preferences', { topics: selected });
      setPreferences(data.preferences);
      toast.success('Feed personalized successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save preferences.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-3"
        >
          Personalize Your Feed
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-navy-200"
        >
          Select 3-5 topics you&apos;re interested in
        </motion.p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full max-w-2xl mb-8">
        {TOPICS.map((topic) => {
          const isActive = selected.includes(topic.name);
          const Icon = topic.icon;

          return (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={topic.name}
              onClick={() => toggleTopic(topic.name)}
              className={`relative glass p-6 rounded-2xl flex flex-col items-center justify-center border cursor-pointer aspect-square transition-all duration-300 ${
                isActive
                  ? 'border-accent-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-navy-800/80'
                  : 'border-white/5 bg-navy-800/30 hover:bg-white/5'
              }`}
            >
              {isActive && (
                <HiCheckCircle className="absolute top-3 right-3 h-5 w-5 text-accent-400" />
              )}
              <div className={`p-4 rounded-2xl mb-3 flex items-center justify-center ${topic.colorClass}`}>
                <Icon className="h-8 w-8" />
              </div>
              <span className="text-sm font-semibold text-white">{topic.name}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-navy-300">
          <span className={selected.length >= 3 && selected.length <= 5 ? 'text-accent-400 font-semibold' : 'text-rose-400'}>
            {selected.length}/5
          </span>{' '}
          topics selected
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          loading={isLoading}
          disabled={selected.length < 3 || selected.length > 5}
          className="shadow-lg shadow-accent/20 px-8 py-3 rounded-xl"
        >
          Continue to Feed &rarr;
        </Button>
      </div>
    </div>
  );
}
