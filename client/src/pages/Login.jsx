import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiEnvelope, HiLockClosed } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
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
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <HiShieldCheck className="h-10 w-10 text-emerald-400" />
          <span className="text-2xl font-bold text-white tracking-tight">truthlens</span>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Welcome back
        </h2>
        <p className="text-gray-400 text-center mb-8">Sign in to continue</p>

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
          <Input
            label="Password"
            type="password"
            icon={<HiLockClosed className="h-5 w-5" />}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="text-right mb-6">
            <Link
              to="/forgot-password"
              className="text-sm text-accent-400 hover:text-accent-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <hr className="flex-1 border-white/10" />
          <span className="text-gray-500 text-sm">or</span>
          <hr className="flex-1 border-white/10" />
        </div>

        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-accent-400 hover:text-accent-300 transition-colors"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
