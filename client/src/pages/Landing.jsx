import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiShieldCheck,
  HiNewspaper,
  HiMagnifyingGlass,
  HiPhoto,
  HiUsers,
  HiChartBar,
} from 'react-icons/hi2';

const features = [
  {
    icon: HiShieldCheck,
    title: 'AI Detection',
    desc: 'Advanced ML models analyze content for misinformation patterns and bias detection.',
  },
  {
    icon: HiNewspaper,
    title: 'News Feed',
    desc: 'Curated news feed with real-time credibility scores for every article.',
  },
  {
    icon: HiMagnifyingGlass,
    title: 'Fact Check',
    desc: 'Cross-reference claims against trusted fact-checking databases automatically.',
  },
  {
    icon: HiPhoto,
    title: 'Image OCR',
    desc: 'Extract and verify text from images, screenshots, and social media posts.',
  },
  {
    icon: HiUsers,
    title: 'Community',
    desc: 'Community-driven verification with voting and collaborative fact-checking.',
  },
  {
    icon: HiChartBar,
    title: 'Analytics',
    desc: 'Comprehensive analytics dashboard with trends and verification insights.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Submit Content',
    desc: 'Paste an article URL, text, or upload an image for verification.',
  },
  {
    num: '02',
    title: 'AI Analysis',
    desc: 'Our AI engines analyze the content using multiple verification methods.',
  },
  {
    num: '03',
    title: 'Get Results',
    desc: 'Receive a detailed credibility report with evidence and confidence scores.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7 },
};

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full gradient-bg opacity-20 blur-3xl animate-float" />
        <div
          className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-500 to-accent-500 opacity-15 blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 opacity-10 blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />

        {/* Navbar-like top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <HiShieldCheck className="h-8 w-8 text-emerald-400" />
              <span className="text-xl font-bold text-white tracking-tight">truthlens</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm px-4 py-2 rounded-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.h1
            {...fadeUp}
            className="text-5xl md:text-7xl font-bold text-white leading-tight"
          >
            Verify the{' '}
            <span className="gradient-text">Truth.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mt-6"
          >
            AI-powered news verification platform that helps you distinguish
            fact from fiction in real-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
          >
            <Link
              to="/register"
              className="btn-primary px-8 py-4 text-lg rounded-xl inline-flex items-center justify-center"
            >
              Get Started →
            </Link>
            <a
              href="#features"
              className="btn-secondary px-8 py-4 text-lg rounded-xl inline-flex items-center justify-center"
            >
              Learn More
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
            Powerful Features
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to verify news, detect misinformation, and make
            informed decisions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-hover p-8"
              >
                <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <feat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-gray-400 text-sm">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            How It Works
          </h2>

          <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass p-8 flex-1 text-center"
              >
                <p className="text-5xl font-bold gradient-text mb-4">
                  {step.num}
                </p>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass max-w-3xl mx-auto p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to verify the truth?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of users who trust truthlens to navigate the
            information landscape.
          </p>
          <Link
            to="/register"
            className="btn-primary px-8 py-4 text-lg rounded-xl inline-block"
          >
            Start Free Today
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HiShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-white">truthlens</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} truthlens. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">Built with React &amp; AI</p>
        </div>
      </footer>
    </div>
  );
}
