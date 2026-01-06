-- VouchFlow Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create video_status enum
CREATE TYPE video_status AS ENUM ('processing', 'ready', 'failed');

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  logo_url TEXT,
  brand_color TEXT DEFAULT '#4F46E5',
  prompts TEXT[] DEFAULT ARRAY[
    'What was your biggest challenge before working with us?',
    'How did we help you overcome it?',
    'What results have you seen since?'
  ],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  submitter_name TEXT,
  submitter_email TEXT,
  duration INTEGER, -- Duration in seconds
  status video_status DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_videos_campaign_id ON videos(campaign_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
-- Users can only see their own campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create campaigns
CREATE POLICY "Users can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own campaigns
CREATE POLICY "Users can update own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own campaigns
CREATE POLICY "Users can delete own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access to campaigns (for recording page)
CREATE POLICY "Public can view campaigns for recording" ON campaigns
  FOR SELECT USING (true);

-- Videos policies
-- Campaign owners can view videos
CREATE POLICY "Campaign owners can view videos" ON videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = videos.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Anyone can insert videos (for public recording)
CREATE POLICY "Anyone can submit videos" ON videos
  FOR INSERT WITH CHECK (true);

-- Campaign owners can update their videos
CREATE POLICY "Campaign owners can update videos" ON videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = videos.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Campaign owners can delete their videos
CREATE POLICY "Campaign owners can delete videos" ON videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = videos.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for campaigns updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to get campaign stats
CREATE OR REPLACE FUNCTION get_campaign_stats(campaign_uuid UUID)
RETURNS TABLE (
  total_videos BIGINT,
  ready_videos BIGINT,
  avg_duration NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_videos,
    COUNT(*) FILTER (WHERE status = 'ready') as ready_videos,
    AVG(duration)::NUMERIC as avg_duration
  FROM videos
  WHERE campaign_id = campaign_uuid;
END;
$$ LANGUAGE plpgsql;
