import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiLockClosed, HiCheckCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../config/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setIsLoading(true);
      await api.post('/auth/reset-password', { password });
      setSuccess(true);
      toast.success('Password updated successfully!');
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

        {!success ? (
          <>
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Create new password
            </h2>
            <p className="text-gray-400 text-center mb-8 text-sm">
              Please enter your new password below.
            </p>

            <form onSubmit={handleSubmit}>
              <Input
                label="New Password"
                type="password"
                icon={<HiLockClosed className="h-5 w-5" />}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                icon={<HiLockClosed className="h-5 w-5" />}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full mt-2"
              >
                Reset Password
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
              Password Reset Complete
            </h2>
            <p className="text-gray-400 mb-8">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <Link
              to="/login"
              className="btn-primary px-6 py-3 rounded-xl inline-block"
            >
              Sign In
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
