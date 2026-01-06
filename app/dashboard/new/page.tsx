'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, ChevronLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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
  '#6366F1', // Indigo light
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
      router.push('/login');
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
      router.push(`/dashboard/${campaign.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900">
              <ChevronLeft className="w-5 h-5" />
              <Video className="w-7 h-7 text-indigo-600" />
              <span className="text-xl font-bold text-slate-900">VouchFlow</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create New Campaign</h1>
          <p className="mt-1 text-slate-600">Set up a new video testimonial campaign</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Basic Information</h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Q1 Customer Testimonials"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g., Acme Inc."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <p className="mt-1 text-sm text-slate-500">This will be shown on the recording page</p>
              </div>

              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-slate-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <p className="mt-1 text-sm text-slate-500">Optional: Your company logo for the recording page</p>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Branding</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Brand Color
              </label>

              <div className="flex items-center space-x-3">
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, brand_color: color })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        formData.brand_color === color
                          ? 'border-slate-900 scale-110'
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
                    className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Preview:</p>
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recording Prompts</h2>
                <p className="text-sm text-slate-500">Questions shown to guide the testimonial</p>
              </div>
              {formData.prompts.length < 5 && (
                <button
                  type="button"
                  onClick={addPrompt}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
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
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  {formData.prompts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrompt(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
              className="px-6 py-3 text-slate-700 font-medium hover:text-slate-900 transition-colors"
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
