'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, Circle, Square, RotateCw, Send, ChevronLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { uploadVideo, getVideoThumbnail } from '@/lib/cloudinary';
import type { Campaign } from '@/lib/supabase/types';

type Stage = 'loading' | 'intro' | 'recording' | 'review' | 'uploading' | 'success' | 'error';

export default function RecordPage() {
  const params = useParams();
  const id = params.id as string;

  const [stage, setStage] = useState<Stage>('loading');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Default prompts (used when campaign has no custom prompts)
  const defaultPrompts = [
    "What was your biggest challenge before working with us?",
    "How did we help you overcome it?",
    "What results have you seen since?"
  ];

  const prompts = campaign?.prompts?.length ? campaign.prompts : defaultPrompts;
  const brandColor = campaign?.brand_color || '#4F46E5';

  // Fetch campaign data on mount
  useEffect(() => {
    async function fetchCampaign() {
      // Handle 'demo' campaign specially
      if (id === 'demo') {
        setCampaign({
          id: 'demo',
          user_id: 'demo',
          name: 'Demo Campaign',
          company_name: 'VouchFlow Demo',
          logo_url: null,
          brand_color: '#4F46E5',
          prompts: defaultPrompts,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setStage('intro');
        return;
      }

      try {
        const response = await fetch(`/api/campaigns/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Campaign not found. Please check the link and try again.');
          } else {
            setError('Failed to load campaign. Please try again later.');
          }
          setStage('error');
          return;
        }
        const data = await response.json();
        setCampaign(data);
        setStage('intro');
      } catch {
        setError('Failed to connect to server. Please check your internet connection.');
        setStage('error');
      }
    }
    fetchCampaign();
  }, [id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStage('recording');
    } catch {
      setError('Unable to access camera. Please check permissions and try again.');
      setStage('error');
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    const countInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countInterval);
          startRecording();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const options = { mimeType: 'video/webm;codecs=vp9' };
    const mediaRecorder = new MediaRecorder(streamRef.current, options);
    mediaRecorderRef.current = mediaRecorder;

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRecordedBlob(blob);
      setStage('review');
      setRecordingTime(0);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 60) {
          stopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const retakeVideo = () => {
    setVideoUrl(null);
    setRecordedBlob(null);
    setRecordingTime(0);
    setUploadProgress(0);
    startCamera();
  };

  const submitVideo = async () => {
    if (!recordedBlob || !campaign) return;

    // For demo campaign, just show success
    if (id === 'demo') {
      setStage('success');
      return;
    }

    setStage('uploading');
    setUploadProgress(0);

    try {
      // Upload to Cloudinary
      const uploadResult = await uploadVideo(recordedBlob, (progress) => {
        setUploadProgress(progress.percentage);
      });

      // Get thumbnail URL
      const thumbnailUrl = getVideoThumbnail(uploadResult.public_id);

      // Save video record to database
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          video_url: uploadResult.secure_url,
          thumbnail_url: thumbnailUrl,
          duration: Math.round(uploadResult.duration || recordingTime)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save video');
      }

      setStage('success');
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload video. Please try again.');
      setStage('review'); // Go back to review so they can retry
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading campaign...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (stage === 'error') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5" />
              {campaign?.logo_url ? (
                <img src={campaign.logo_url} alt={campaign.company_name || ''} className="h-8" />
              ) : (
                <>
                  <Video className="w-6 h-6" style={{ color: brandColor }} />
                  <span className="text-lg font-semibold">VouchFlow</span>
                </>
              )}
            </Link>
            <div className="text-sm text-slate-400">
              {campaign?.company_name || campaign?.name || 'Campaign'}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Stage */}
        {stage === 'intro' && (
          <div className="text-center py-12">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${brandColor}20` }}
            >
              <Video className="w-10 h-10" style={{ color: brandColor }} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Share Your Experience
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              {campaign?.company_name
                ? `${campaign.company_name} would love to hear about your experience! Record a quick video testimonial answering a few simple questions.`
                : "We'd love to hear about your experience! Record a quick video testimonial answering a few simple questions."}
            </p>

            <div className="bg-slate-800 rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">You'll be asked:</h3>
              <div className="space-y-3 text-left">
                {prompts.map((prompt, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${brandColor}20` }}
                    >
                      <span className="text-sm" style={{ color: brandColor }}>{index + 1}</span>
                    </div>
                    <p className="text-slate-300">{prompt}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={startCamera}
                className="px-8 py-4 text-white rounded-lg font-medium transition-all shadow-lg inline-flex items-center space-x-2"
                style={{
                  backgroundColor: brandColor,
                  boxShadow: `0 10px 40px -10px ${brandColor}80`
                }}
              >
                <Video className="w-5 h-5" />
                <span>Start Recording</span>
              </button>

              <p className="text-sm text-slate-500">
                60 seconds max - Camera & microphone access required
              </p>
            </div>
          </div>
        )}

        {/* Recording Stage */}
        {stage === 'recording' && (
          <div className="space-y-6">
            {/* Current Prompt */}
            <div
              className="rounded-lg p-6 text-center"
              style={{ backgroundColor: brandColor }}
            >
              <p className="text-sm opacity-80 mb-2">Question {currentPrompt + 1} of {prompts.length}</p>
              <h2 className="text-2xl font-semibold">{prompts[currentPrompt]}</h2>
            </div>

            {/* Video Preview */}
            <div className="relative bg-slate-800 rounded-2xl overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                  <div className="text-8xl font-bold text-white animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500 px-3 py-2 rounded-full">
                  <Circle className="w-3 h-3 fill-white animate-pulse" />
                  <span className="text-sm font-medium">REC {formatTime(recordingTime)}</span>
                </div>
              )}

              {/* Time Remaining */}
              {isRecording && (
                <div className="absolute top-4 right-4 bg-slate-900/80 px-3 py-2 rounded-full">
                  <span className="text-sm font-medium">{60 - recordingTime}s left</span>
                </div>
              )}
            </div>

            {/* Prompt Navigation */}
            {isRecording && prompts.length > 1 && (
              <div className="flex justify-center space-x-2">
                {prompts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPrompt(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentPrompt
                        ? 'scale-125'
                        : 'opacity-50 hover:opacity-75'
                    }`}
                    style={{ backgroundColor: brandColor }}
                    aria-label={`Go to question ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              {!isRecording && countdown === null ? (
                <button
                  onClick={startCountdown}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
                >
                  <Circle className="w-8 h-8" />
                </button>
              ) : isRecording ? (
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
                >
                  <Square className="w-6 h-6" />
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* Review Stage */}
        {stage === 'review' && videoUrl && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Review Your Video</h2>
              <p className="text-slate-400">Happy with it? Submit below. Want to retake?</p>
            </div>

            <div className="bg-slate-800 rounded-2xl overflow-hidden aspect-video">
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-cover"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={retakeVideo}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all inline-flex items-center justify-center space-x-2"
              >
                <RotateCw className="w-5 h-5" />
                <span>Retake Video</span>
              </button>

              <button
                onClick={submitVideo}
                className="px-6 py-3 text-white rounded-lg font-medium transition-all shadow-lg inline-flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: brandColor,
                  boxShadow: `0 10px 40px -10px ${brandColor}80`
                }}
              >
                <Send className="w-5 h-5" />
                <span>Submit Testimonial</span>
              </button>
            </div>
          </div>
        )}

        {/* Uploading Stage */}
        {stage === 'uploading' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>

            <h2 className="text-2xl font-bold mb-4">Uploading Your Video</h2>

            <div className="max-w-md mx-auto mb-4">
              <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                    backgroundColor: brandColor
                  }}
                />
              </div>
              <p className="text-slate-400 mt-2">{uploadProgress}% complete</p>
            </div>

            <p className="text-sm text-slate-500">
              Please don't close this page...
            </p>
          </div>
        )}

        {/* Success Stage */}
        {stage === 'success' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Thank You!
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Your video testimonial has been submitted successfully.
              {campaign?.company_name
                ? ` ${campaign.company_name} truly appreciates you taking the time to share your experience!`
                : ' We truly appreciate you taking the time to share your experience!'}
            </p>

            <Link
              href="/"
              className="inline-flex items-center space-x-2 transition-colors"
              style={{ color: brandColor }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
