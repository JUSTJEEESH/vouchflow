'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, ChevronLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoUpload } from '@/components/LogoUpload';

const PRESET_COLORS = [
  '#4F46E5', // Indigo
  '#7C3AED', // Violet
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#0F172A', // Slate 900 (dark)
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    logo_url: '',
    brand_color: '#4F46E5',
    prompts: [
      'What was your biggest challenge before working with us?',
      'How did we help you overcome it?',
      'What results have you seen since?'
    ]
  });

  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/login');
    }
  }

  function updatePrompt(index: number, value: string) {
    const newPrompts = [...formData.prompts];
    newPrompts[index] = value;
    setFormData({ ...formData, prompts: newPrompts });
  }

  function addPrompt() {
    if (formData.prompts.length < 5) {
      setFormData({
        ...formData,
        prompts: [...formData.prompts, '']
      });
    }
  }

  function removePrompt(index: number) {
    if (formData.prompts.length > 1) {
      const newPrompts = formData.prompts.filter((_, i) => i !== index);
      setFormData({ ...formData, prompts: newPrompts });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          prompts: formData.prompts.filter(p => p.trim() !== '')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const campaign = await response.json();
      setRedirecting(true);

      // Use replace to avoid back button issues
      window.location.href = `/dashboard/${campaign.id}`;
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
      setLoading(false);
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Creating your campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              <ChevronLeft className="w-5 h-5" />
              <Video className="w-7 h-7 text-indigo-600" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">VouchFlow</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Campaign</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Set up a new video testimonial campaign</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Basic Information</h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Q1 Customer Testimonials"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g., Acme Inc."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This will be shown on the recording page</p>
              </div>

              <LogoUpload
                value={formData.logo_url}
                onChange={(url) => setFormData({ ...formData, logo_url: url })}
              />
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Branding</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Brand Color
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, brand_color: color })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        formData.brand_color === color
                          ? 'border-indigo-500 scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-800'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">or</span>
                  <input
                    type="color"
                    value={formData.brand_color}
                    onChange={e => setFormData({ ...formData, brand_color: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Preview:</p>
                <button
                  type="button"
                  className="px-4 py-2 text-white rounded-lg font-medium"
                  style={{ backgroundColor: formData.brand_color }}
                >
                  Start Recording
                </button>
              </div>
            </div>
          </div>

          {/* Prompts */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recording Prompts</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Questions shown to guide the testimonial</p>
              </div>
              {formData.prompts.length < 5 && (
                <button
                  type="button"
                  onClick={addPrompt}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
              )}
            </div>

            <div className="space-y-4">
              {formData.prompts.map((prompt, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span
                    className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `${formData.brand_color}20`,
                      color: formData.brand_color
                    }}
                  >
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={prompt}
                    onChange={e => updatePrompt(index, e.target.value)}
                    placeholder={`Question ${index + 1}`}
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  {formData.prompts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrompt(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-6 py-3 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              style={{ backgroundColor: formData.brand_color }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
