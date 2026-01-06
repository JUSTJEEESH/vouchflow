'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, Circle, Square, RotateCw, Send, ChevronLeft, CheckCircle, Loader2, AlertCircle, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { uploadVideo, getVideoThumbnail } from '@/lib/cloudinary';
import { getContrastTextColor } from '@/lib/colors';
import type { Campaign, AspectRatio } from '@/lib/supabase/types';

type Stage = 'loading' | 'intro' | 'recording' | 'review' | 'uploading' | 'success' | 'error';

// Aspect ratio configurations
const ASPECT_CONFIGS: Record<AspectRatio, { width: number; height: number; cssClass: string }> = {
  portrait: { width: 720, height: 1280, cssClass: 'aspect-[9/16]' },
  square: { width: 720, height: 720, cssClass: 'aspect-square' },
  landscape: { width: 1280, height: 720, cssClass: 'aspect-video' },
};

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
  const [coveredPrompts, setCoveredPrompts] = useState<Set<number>>(new Set());
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Default prompts
  const defaultPrompts = [
    "What was your biggest challenge before working with us?",
    "How did we help you overcome it?",
    "What results have you seen since?"
  ];

  const prompts = campaign?.prompts?.length ? campaign.prompts : defaultPrompts;
  const primaryColor = campaign?.brand_color || '#4F46E5';
  const secondaryColor = campaign?.secondary_color || '#1E293B';
  const aspectRatio: AspectRatio = campaign?.aspect_ratio || 'portrait';
  const aspectConfig = ASPECT_CONFIGS[aspectRatio];

  // Get contrast text colors
  const primaryTextColor = getContrastTextColor(primaryColor);
  const secondaryTextColor = getContrastTextColor(secondaryColor);

  // Fetch campaign data on mount
  useEffect(() => {
    async function fetchCampaign() {
      if (id === 'demo') {
        setCampaign({
          id: 'demo',
          user_id: 'demo',
          name: 'Demo Campaign',
          company_name: 'VouchFlow Demo',
          logo_url: null,
          brand_color: '#4F46E5',
          secondary_color: '#1E293B',
          aspect_ratio: 'portrait',
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
        video: {
          facingMode: 'user',
          width: { ideal: aspectConfig.width },
          height: { ideal: aspectConfig.height }
        },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
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
    setCoveredPrompts(new Set([0]));

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 120) {
          stopRecording();
          return 120;
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
    setCoveredPrompts(new Set());
    setCurrentPrompt(0);
    setCameraReady(false);
    startCamera();
  };

  const selectPrompt = (index: number) => {
    setCurrentPrompt(index);
    setCoveredPrompts(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  const nextPrompt = () => {
    const next = (currentPrompt + 1) % prompts.length;
    selectPrompt(next);
  };

  const prevPrompt = () => {
    const prev = currentPrompt === 0 ? prompts.length - 1 : currentPrompt - 1;
    selectPrompt(prev);
  };

  const submitVideo = async () => {
    if (!recordedBlob || !campaign) return;

    if (id === 'demo') {
      setStage('success');
      return;
    }

    setStage('uploading');
    setUploadProgress(0);

    try {
      const uploadResult = await uploadVideo(recordedBlob, (progress) => {
        setUploadProgress(progress.percentage);
      });

      const thumbnailUrl = getVideoThumbnail(uploadResult.public_id);

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
      setStage('review');
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: secondaryColor }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <p style={{ color: secondaryTextColor, opacity: 0.7 }}>Loading campaign...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (stage === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: secondaryColor }}>
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: secondaryTextColor }}>Something went wrong</h2>
          <p className="mb-6" style={{ color: secondaryTextColor, opacity: 0.7 }}>{error}</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 transition-colors hover:opacity-80"
            style={{ color: primaryColor }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: secondaryColor, color: secondaryTextColor }}>
      {/* Compact Header */}
      <nav className="flex-shrink-0 border-b" style={{ borderColor: `${secondaryTextColor}15` }}>
        <div className="px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-5 h-5" />
            {campaign?.logo_url ? (
              <img src={campaign.logo_url} alt={campaign.company_name || ''} className="h-6" />
            ) : (
              <span className="font-semibold">{campaign?.company_name || 'VouchFlow'}</span>
            )}
          </Link>
          {stage === 'recording' && isRecording && (
            <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm">
              <Circle className="w-2 h-2 fill-white animate-pulse" />
              <span className="font-medium">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Intro Stage */}
        {stage === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Video className="w-8 h-8" style={{ color: primaryColor }} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Share Your Experience</h1>

            <p className="text-sm mb-6 max-w-sm" style={{ opacity: 0.7 }}>
              Record a quick video answering {prompts.length} simple questions
            </p>

            <div className="w-full max-w-sm mb-6 rounded-xl p-4 text-left" style={{ backgroundColor: `${secondaryTextColor}08` }}>
              {prompts.map((prompt, index) => (
                <div key={index} className="flex items-start gap-2 py-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm" style={{ opacity: 0.9 }}>{prompt}</span>
                </div>
              ))}
            </div>

            <button
              onClick={startCamera}
              className="px-8 py-4 rounded-xl font-medium transition-all shadow-lg inline-flex items-center space-x-2 hover:opacity-90"
              style={{
                backgroundColor: primaryColor,
                color: primaryTextColor,
                boxShadow: `0 10px 40px -10px ${primaryColor}80`
              }}
            >
              <Video className="w-5 h-5" />
              <span>Start Recording</span>
            </button>

            <p className="text-xs mt-4" style={{ opacity: 0.5 }}>
              Camera & microphone required • 2 min max
            </p>
          </div>
        )}

        {/* Recording Stage - Single Screen Layout */}
        {stage === 'recording' && (
          <div className="flex-1 flex flex-col p-4 max-h-screen overflow-hidden">
            {/* Current Question - Always Visible at Top */}
            <div className="flex-shrink-0 mb-4">
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${primaryTextColor}20`, color: primaryTextColor }}
                  >
                    Question {currentPrompt + 1} of {prompts.length}
                  </span>
                  {isRecording && (
                    <span className="text-xs" style={{ color: primaryTextColor, opacity: 0.8 }}>
                      {120 - recordingTime}s left
                    </span>
                  )}
                </div>
                <p className="font-medium" style={{ color: primaryTextColor }}>
                  {prompts[currentPrompt]}
                </p>
              </div>
            </div>

            {/* Video Preview - Fills Available Space */}
            <div className="flex-1 flex items-center justify-center min-h-0 mb-4">
              <div
                className={`relative rounded-2xl overflow-hidden ${aspectConfig.cssClass} max-h-full`}
                style={{
                  backgroundColor: '#000',
                  width: aspectRatio === 'portrait' ? 'auto' : '100%',
                  height: aspectRatio === 'portrait' ? '100%' : 'auto',
                  maxWidth: aspectRatio === 'portrait' ? '300px' : '500px'
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />

                {/* Camera loading indicator */}
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="text-7xl font-bold text-white animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Question Navigation Pills - Always Visible */}
            <div className="flex-shrink-0 mb-4">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {prompts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => selectPrompt(index)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all font-medium text-sm"
                    style={{
                      backgroundColor: currentPrompt === index ? primaryColor : `${secondaryTextColor}15`,
                      color: currentPrompt === index ? primaryTextColor : secondaryTextColor,
                      opacity: currentPrompt === index ? 1 : 0.7,
                      transform: currentPrompt === index ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {coveredPrompts.has(index) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs mt-2" style={{ opacity: 0.5 }}>
                Tap to switch questions
              </p>
            </div>

            {/* Record/Stop Button */}
            <div className="flex-shrink-0 flex justify-center pb-4">
              {!isRecording && countdown === null ? (
                <button
                  onClick={startCountdown}
                  disabled={!cameraReady}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50"
                >
                  <Circle className="w-8 h-8 text-white" />
                </button>
              ) : isRecording ? (
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 animate-pulse"
                >
                  <Square className="w-6 h-6 text-white" />
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* Review Stage */}
        {stage === 'review' && videoUrl && (
          <div className="flex-1 flex flex-col p-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-1">Review Your Video</h2>
              <p className="text-sm" style={{ opacity: 0.7 }}>Happy with it? Submit below!</p>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-0 mb-4">
              <div
                className={`rounded-2xl overflow-hidden ${aspectConfig.cssClass} max-h-full`}
                style={{
                  backgroundColor: '#000',
                  width: aspectRatio === 'portrait' ? 'auto' : '100%',
                  height: aspectRatio === 'portrait' ? '100%' : 'auto',
                  maxWidth: aspectRatio === 'portrait' ? '300px' : '500px'
                }}
              >
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 justify-center pb-4">
              <button
                onClick={retakeVideo}
                className="px-6 py-3 rounded-xl font-medium transition-all inline-flex items-center justify-center space-x-2"
                style={{ backgroundColor: `${secondaryTextColor}15`, color: secondaryTextColor }}
              >
                <RotateCw className="w-5 h-5" />
                <span>Retake</span>
              </button>

              <button
                onClick={submitVideo}
                className="px-6 py-3 rounded-xl font-medium transition-all shadow-lg inline-flex items-center justify-center space-x-2 hover:opacity-90"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryTextColor,
                  boxShadow: `0 10px 40px -10px ${primaryColor}80`
                }}
              >
                <Send className="w-5 h-5" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        )}

        {/* Uploading Stage */}
        {stage === 'uploading' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${primaryColor}20` }}>
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
            </div>

            <h2 className="text-xl font-bold mb-4">Uploading...</h2>

            <div className="w-full max-w-xs mb-2">
              <div className="rounded-full h-2 overflow-hidden" style={{ backgroundColor: `${secondaryTextColor}20` }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%`, backgroundColor: primaryColor }}
                />
              </div>
            </div>
            <p className="text-sm" style={{ opacity: 0.7 }}>{uploadProgress}%</p>

            <p className="text-xs mt-4" style={{ opacity: 0.5 }}>
              Please don't close this page
            </p>
          </div>
        )}

        {/* Success Stage */}
        {stage === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Thank You!</h1>

            <p className="text-sm mb-6 max-w-sm" style={{ opacity: 0.7 }}>
              Your testimonial has been submitted successfully.
              {campaign?.company_name && ` ${campaign.company_name} appreciates your time!`}
            </p>

            <Link
              href="/"
              className="inline-flex items-center space-x-2 transition-colors hover:opacity-80"
              style={{ color: primaryColor }}
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
