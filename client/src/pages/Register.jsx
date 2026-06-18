import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiShieldCheck,
  HiUser,
  HiEnvelope,
  HiLockClosed,
  HiCheckCircle,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const TOPICS = [
  'Politics',
  'Technology',
  'Business',
  'Science',
  'Health',
  'Sports',
  'Entertainment',
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function Register() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isVerificationPending, setIsVerificationPending] = useState(false);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const goToStep = (target) => {
    setDir(target > step ? 1 : -1);
    setStep(target);
  };

  const handleStep1 = () => {
    if (!form.full_name.trim()) return toast.error('Full name is required');
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return toast.error('Valid email is required');
    if (!form.password || form.password.length < 8)
      return toast.error('Password must be at least 8 characters');
    goToStep(2);
  };

  const handleStep2 = async () => {
    try {
      setIsLoading(true);
      const data = await signUp(form.email, form.password, form.full_name);

      if (data.session) {
        setIsVerificationPending(false);
        const { supabase } = await import('../config/supabase');
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (selectedTopics.length > 0) {
          await api.put('/profile/preferences', { topics: selectedTopics });
        }
        toast.success('Account created!');
      } else {
        setIsVerificationPending(true);
        toast.success('Verification email sent!');
      }

      goToStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass max-w-md w-full p-8"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <HiShieldCheck className="h-10 w-10 text-emerald-400" />
          <span className="text-2xl font-bold text-white tracking-tight">truthlens</span>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                s <= step ? 'gradient-bg' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Create your account
              </h2>
              <p className="text-gray-400 text-center mb-8 text-sm">
                Get started with truthlens in seconds
              </p>

              <Input
                label="Full Name"
                icon={<HiUser className="h-5 w-5" />}
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => updateForm('full_name', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                icon={<HiEnvelope className="h-5 w-5" />}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                icon={<HiLockClosed className="h-5 w-5" />}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(e) => updateForm('password', e.target.value)}
              />

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-2"
                onClick={handleStep1}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Pick your interests
              </h2>
              <p className="text-gray-400 text-center mb-6 text-sm">
                Select topics you care about
              </p>

              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {TOPICS.map((topic) => {
                  const active = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${
                        active
                          ? 'gradient-bg text-white shadow-lg shadow-accent/20'
                          : 'glass-sm text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => goToStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={isLoading}
                  onClick={handleStep2}
                >
                  Create Account
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {isVerificationPending ? (
                <>
                  <HiEnvelope className="h-16 w-16 text-accent-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Verify your email
                  </h2>
                  <p className="text-gray-400 mb-8">
                    A confirmation link has been sent to{' '}
                    <span className="text-white font-medium">{form.email}</span>.
                    Please check your inbox and verify your account to log in.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Go to Login Screen
                  </Button>
                </>
              ) : (
                <>
                  <HiCheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    You&apos;re all set!
                  </h2>
                  <p className="text-gray-400 mb-8">
                    Your account has been created successfully.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard →
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {step < 3 && (
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent-400 hover:text-accent-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
