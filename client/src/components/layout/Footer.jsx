import { HiShieldCheck } from 'react-icons/hi2';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HiShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-white">truthlens</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} truthlens. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">Built with React &amp; AI</p>
        </div>
      </div>
    </footer>
  );
}
