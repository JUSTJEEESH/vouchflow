'use client';

import { Video, CheckCircle, Zap, Shield } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Video className="w-7 h-7 text-indigo-600" />
              <span className="text-xl font-semibold text-slate-900 dark:text-white">VouchFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-8">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Video Testimonials Made Simple</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Collect Authentic
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Video Testimonials
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Send a magic link. Your clients record. You get powerful social proof.
              <br className="hidden sm:block" />
              No logins. No friction. Just results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/record/demo"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 flex items-center justify-center space-x-2"
              >
                <Video className="w-5 h-5" />
                <span>Try Demo Recording</span>
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-600 shadow-sm text-center"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">60-Second Setup</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Create a campaign, copy your magic link, and start collecting testimonials instantly.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Zero Friction</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your clients click, record, and submit. No sign-ups. No downloads. No hassle.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Built for Trust</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Authentic video testimonials that convert browsers into buyers for your high-ticket offer.
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="py-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Trusted by service providers who close deals</p>
          <div className="flex justify-center items-center space-x-8 text-slate-400 dark:text-slate-500">
            <div className="text-2xl font-bold">Agency</div>
            <div className="text-2xl font-bold">Coaching</div>
            <div className="text-2xl font-bold">Consulting</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <Video className="w-6 h-6 text-indigo-600" />
              <span className="text-lg font-semibold text-slate-900 dark:text-white">VouchFlow</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2026 VouchFlow. Testimonials made simple.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
