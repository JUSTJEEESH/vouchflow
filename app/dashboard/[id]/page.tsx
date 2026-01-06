'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Video, ChevronLeft, Play, Download, Trash2, Loader2, Copy, ExternalLink, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Campaign, Video as VideoType } from '@/lib/supabase/types';

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    fetchCampaignAndVideos();
  }, [id]);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
    }
  }

  async function fetchCampaignAndVideos() {
    try {
      const campaignRes = await fetch(`/api/campaigns/${id}`);
      if (!campaignRes.ok) throw new Error('Campaign not found');
      const campaignData = await campaignRes.json();
      setCampaign(campaignData);

      const videosRes = await fetch(`/api/videos?campaign_id=${id}`);
      if (videosRes.ok) {
        const videosData = await videosRes.json();
        setVideos(videosData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteVideo(videoId: string) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      if (response.ok) {
        setVideos(videos.filter(v => v.id !== videoId));
        if (selectedVideo?.id === videoId) {
          setSelectedVideo(null);
        }
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }

  async function copyRecordingLink() {
    const url = `${window.location.origin}/record/${id}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Campaign not found</h2>
          <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaign Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${campaign.brand_color}20` }}
              >
                {campaign.logo_url ? (
                  <img src={campaign.logo_url} alt="" className="w-8 h-8 object-contain" />
                ) : (
                  <Video className="w-6 h-6" style={{ color: campaign.brand_color }} />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{campaign.name}</h1>
                {campaign.company_name && (
                  <p className="text-slate-600 dark:text-slate-400">{campaign.company_name}</p>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={copyRecordingLink}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {copiedLink ? (
                  <span className="text-green-600 dark:text-green-400">Copied!</span>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </button>

              <Link
                href={`/record/${id}`}
                target="_blank"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: campaign.brand_color }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Recording Page
              </Link>
            </div>
          </div>

          {/* Prompts */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Recording Prompts</h3>
            <div className="flex flex-wrap gap-2">
              {campaign.prompts?.map((prompt, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-full"
                >
                  {index + 1}. {prompt}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Videos ({videos.length})
          </h2>
        </div>

        {videos.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No videos yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Share your recording link to start collecting testimonials.</p>
            <button
              onClick={copyRecordingLink}
              className="inline-flex items-center px-4 py-2 text-white rounded-lg font-medium transition-colors"
              style={{ backgroundColor: campaign.brand_color }}
            >
              <Copy className="w-5 h-5 mr-2" />
              Copy Recording Link
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow"
              >
                {/* Thumbnail */}
                <div
                  className="relative aspect-video bg-slate-900 cursor-pointer group"
                  onClick={() => setSelectedVideo(video)}
                >
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-12 h-12 text-slate-600" />
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-slate-900 ml-1" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Video info */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(video.created_at)}
                      </p>
                      {video.submitter_name && (
                        <p className="font-medium text-slate-900 dark:text-white">{video.submitter_name}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <a
                        href={video.video_url}
                        download
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl overflow-hidden max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div>
                <p className="text-white font-medium">
                  {selectedVideo.submitter_name || 'Video Testimonial'}
                </p>
                <p className="text-slate-400 text-sm">
                  {formatDate(selectedVideo.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video">
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
