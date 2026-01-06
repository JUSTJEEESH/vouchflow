'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Video, Plus, Copy, ExternalLink, Trash2, Loader2, LogOut, BarChart3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Campaign } from '@/lib/supabase/types';

interface CampaignWithStats extends Campaign {
  video_count: number;
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    fetchCampaigns();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setUser({ email: user.email || '' });
  }

  async function fetchCampaigns() {
    try {
      const response = await fetch('/api/campaigns');
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch campaigns');
      }
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCampaign(id: string) {
    if (!confirm('Are you sure you want to delete this campaign? All videos will be lost.')) {
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCampaigns(campaigns.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  }

  async function copyLink(campaignId: string) {
    const url = `${window.location.origin}/record/${campaignId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(campaignId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Video className="w-7 h-7 text-indigo-600" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">VouchFlow</span>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">{user?.email}</span>
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Campaigns</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Manage your video testimonial campaigns</p>
          </div>

          <Link
            href="/dashboard/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Campaign
          </Link>
        </div>

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No campaigns yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first campaign to start collecting video testimonials.</p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow"
              >
                {/* Campaign Header */}
                <div
                  className="h-2"
                  style={{ backgroundColor: campaign.brand_color }}
                />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{campaign.name}</h3>
                      {campaign.company_name && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{campaign.company_name}</p>
                      )}
                    </div>

                    {campaign.logo_url && (
                      <img
                        src={campaign.logo_url}
                        alt=""
                        className="w-10 h-10 object-contain rounded ml-3 flex-shrink-0"
                      />
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm">
                        {campaign.video_count} video{campaign.video_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/${campaign.id}`}
                      className="flex-1 px-3 py-2 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      View Videos
                    </Link>

                    <button
                      onClick={() => copyLink(campaign.id)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Copy recording link"
                    >
                      {copiedId === campaign.id ? (
                        <span className="text-green-600 dark:text-green-400 text-xs font-medium">Copied!</span>
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>

                    <Link
                      href={`/record/${campaign.id}`}
                      target="_blank"
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Open recording page"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>

                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete campaign"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
