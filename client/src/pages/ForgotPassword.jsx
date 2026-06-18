import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiEnvelope, HiCheckCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await resetPassword(email);
      setSent(true);
      toast.success('Check your email!');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass max-w-md w-full p-8"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <HiShieldCheck className="h-10 w-10 text-emerald-400" />
          <span className="text-2xl font-bold text-white tracking-tight">truthlens</span>
        </div>

        {!sent ? (
          <>
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Reset your password
            </h2>
            <p className="text-gray-400 text-center mb-8 text-sm">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                icon={<HiEnvelope className="h-5 w-5" />}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full mt-2"
              >
                Send Reset Link
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              <Link
                to="/login"
                className="text-accent-400 hover:text-accent-300 transition-colors"
              >
                ← Back to Sign In
              </Link>
            </p>
          </>
        ) : (
          <div className="text-center">
            <HiCheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Check your email
            </h2>
            <p className="text-gray-400 mb-8">
              We&apos;ve sent a password reset link to{' '}
              <span className="text-white font-medium">{email}</span>
            </p>
            <Link
              to="/login"
              className="btn-primary px-6 py-3 rounded-xl inline-block"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
