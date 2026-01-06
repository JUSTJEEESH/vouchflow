# VouchFlow - Complete Project Documentation

**Video Testimonials Made Simple**

A full-stack video testimonial collection platform built with Next.js 14, Supabase, and Cloudinary.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Features Implemented](#features-implemented)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Key Components](#key-components)
7. [Environment Variables](#environment-variables)
8. [Cloudinary Setup](#cloudinary-setup)
9. [Deployment](#deployment)
10. [Bugs Fixed](#bugs-fixed)
11. [Future Enhancements](#future-enhancements)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | App Router, Server Components, API Routes |
| **React 18** | UI Components (NOT React 19) |
| **TypeScript** | Type safety throughout |
| **Tailwind CSS** | Styling with `darkMode: 'class'` strategy |
| **Supabase** | Authentication (Google OAuth) + PostgreSQL database |
| **Cloudinary** | Video and image upload/storage |
| **Lucide React** | Icon library |
| **MediaRecorder API** | Browser-based video recording |

---

## Project Structure

```
vouchflow/
├── app/
│   ├── api/
│   │   ├── auth/callback/route.ts     # Supabase OAuth callback
│   │   ├── campaigns/
│   │   │   ├── route.ts               # GET all, POST new campaign
│   │   │   └── [id]/route.ts          # GET, PATCH, DELETE single campaign
│   │   ├── videos/
│   │   │   ├── route.ts               # POST new video
│   │   │   └── [id]/route.ts          # GET, DELETE single video
│   │   └── upload/route.ts            # Cloudinary upload signature
│   ├── dashboard/
│   │   ├── page.tsx                   # Main dashboard (campaigns list)
│   │   ├── new/page.tsx               # Create new campaign form
│   │   └── [id]/page.tsx              # Campaign detail (videos list)
│   ├── login/page.tsx                 # Login page with Google OAuth
│   ├── record/[id]/page.tsx           # Public recording interface
│   ├── layout.tsx                     # Root layout with ThemeProvider
│   ├── page.tsx                       # Landing page
│   └── globals.css                    # Global styles
├── components/
│   ├── Logo.tsx                       # VouchFlow logo component
│   └── ThemeToggle.tsx                # Dark/light mode toggle
├── lib/
│   ├── cloudinary.ts                  # Cloudinary upload utilities
│   ├── colors.ts                      # WCAG contrast utilities
│   ├── contexts/
│   │   └── theme.tsx                  # Theme context provider
│   └── supabase/
│       ├── client.ts                  # Browser Supabase client
│       ├── server.ts                  # Server Supabase client
│       └── types.ts                   # TypeScript types
├── supabase/
│   ├── schema.sql                     # Complete database schema
│   └── migrations/
│       └── 001_add_secondary_color_and_aspect_ratio.sql
├── middleware.ts                       # Auth route protection
└── package.json
```

---

## Features Implemented

### Authentication
- Google OAuth via Supabase Auth
- Protected dashboard routes via middleware
- Automatic redirect to login for unauthenticated users

### Campaign Management
- Create campaigns with custom branding
- Edit campaign settings (name, colors, prompts, aspect ratio)
- Delete campaigns
- View all campaigns with video counts
- Copy shareable recording links

### Brand Customization
- **Primary color**: Full spectrum color picker for brand accent
- **Secondary color**: Full spectrum picker for backgrounds/text
- **Logo upload**: Upload company logo via Cloudinary
- **Custom prompts**: 3 configurable questions for testimonials
- **Aspect ratio**: Portrait (9:16), Square (1:1), or Landscape (16:9)
- **Auto-contrast text**: WCAG-compliant text colors based on background luminance

### Video Recording (Public Interface)
- No login required for recording
- Camera permission request with clear instructions
- Live video preview with mirror mode
- All questions visible on single screen (no scrolling)
- Question pills showing covered/current/upcoming questions
- 3-2-1 countdown before recording
- 60-second maximum with visual timer
- Recording indicator (REC badge)
- Review recorded video before submission
- Retake option
- Upload to Cloudinary on submit

### Dashboard
- Campaign cards with video counts
- Quick access to recording links
- Video gallery per campaign
- Video playback and download
- Delete videos
- Dark mode toggle (persisted to localStorage)

### Dark Mode
- System-aware default theme
- Manual toggle in header
- No hydration flash (inline script in `<head>`)
- Persisted preference in localStorage

---

## Database Schema

### Complete SQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create aspect_ratio enum
CREATE TYPE aspect_ratio AS ENUM ('portrait', 'square', 'landscape');

-- Campaigns table
CREATE TABLE campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  logo_url TEXT,
  brand_color TEXT DEFAULT '#4F46E5',
  secondary_color TEXT DEFAULT '#1E293B',
  aspect_ratio aspect_ratio DEFAULT 'portrait',
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  cloudinary_public_id TEXT NOT NULL,
  cloudinary_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  respondent_name TEXT,
  respondent_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Public read access for recording page
CREATE POLICY "Public can view campaigns for recording"
  ON campaigns FOR SELECT
  USING (true);

-- Videos policies
CREATE POLICY "Users can view videos from own campaigns"
  ON videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = videos.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert videos"
  ON videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete videos from own campaigns"
  ON videos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = videos.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_videos_campaign_id ON videos(campaign_id);
```

### Migration for Existing Databases

If you already have the campaigns table, run this migration:

```sql
-- Create aspect_ratio enum (if it doesn't exist)
DO $$ BEGIN
  CREATE TYPE aspect_ratio AS ENUM ('portrait', 'square', 'landscape');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add secondary_color column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1E293B';

-- Add aspect_ratio column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS aspect_ratio aspect_ratio DEFAULT 'portrait';
```

---

## API Endpoints

### Campaigns

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/campaigns` | List all user campaigns with video counts | Yes |
| POST | `/api/campaigns` | Create new campaign | Yes |
| GET | `/api/campaigns/[id]` | Get single campaign (public for recording) | No |
| PATCH | `/api/campaigns/[id]` | Update campaign | Yes |
| DELETE | `/api/campaigns/[id]` | Delete campaign | Yes |

### Videos

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/videos` | Create video record after upload | No |
| GET | `/api/videos/[id]` | Get video details | Yes |
| DELETE | `/api/videos/[id]` | Delete video | Yes |

### Upload

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload` | Get Cloudinary upload signature | No |

---

## Key Components

### `lib/colors.ts` - Color Utilities

```typescript
// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null

// Calculate relative luminance (WCAG formula)
export function getLuminance(hex: string): number

// Get contrasting text color (black or white)
export function getContrastTextColor(backgroundColor: string): 'white' | 'black'
```

### `lib/contexts/theme.tsx` - Theme Provider

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;  // Prevents hydration mismatch
}
```

### `app/record/[id]/page.tsx` - Recording Interface

Key features:
- Uses `useParams()` hook (React 18 compatible)
- `cameraReady` state with `onloadedmetadata` handler
- Mirror transform: `style={{ transform: 'scaleX(-1)' }}`
- Aspect ratio configuration
- Single-screen layout with no scrolling

```typescript
const ASPECT_CONFIGS: Record<AspectRatio, { width: number; height: number; cssClass: string }> = {
  portrait: { width: 720, height: 1280, cssClass: 'aspect-[9/16]' },
  square: { width: 720, height: 720, cssClass: 'aspect-square' },
  landscape: { width: 1280, height: 720, cssClass: 'aspect-video' },
};
```

---

## Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## Cloudinary Setup

1. Create a Cloudinary account at https://cloudinary.com
2. Get your cloud name, API key, and API secret from the dashboard
3. Create an upload preset:
   - Go to Settings → Upload
   - Add upload preset
   - Set signing mode to "Signed"
   - Set folder to "vouchflow" (optional)
   - Enable "Auto-create folders"
4. Configure allowed formats: `mp4, webm, mov, avi`

### Upload Flow

1. Client requests signed upload URL from `/api/upload`
2. Client uploads video directly to Cloudinary
3. Client sends Cloudinary response to `/api/videos` to create database record

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Vercel

Add all variables from `.env.local` to your Vercel project settings.

### Supabase Configuration

1. Add your Vercel deployment URL to Supabase Auth settings:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/api/auth/callback`

2. Enable Google OAuth in Supabase:
   - Go to Authentication → Providers → Google
   - Add your Google OAuth credentials

---

## Bugs Fixed

### 1. ThemeProvider Hydration Error
- **Issue**: Client-side exceptions on navigation
- **Cause**: ThemeProvider returned `null` when not mounted
- **Fix**: Always render children, use `mounted` flag only for ThemeToggle icon

### 2. React 19 `use()` Hook Incompatibility
- **Issue**: Client-side errors on dynamic route pages
- **Cause**: Code used React 19's `use()` hook with Promise params, but app runs React 18
- **Fix**: Changed to `useParams()` hook, removed Promise types from API params

### 3. Set Iteration TypeScript Error
- **Issue**: `Type 'Set<number>' can only be iterated through...`
- **Fix**: Changed `new Set([...prev, index])` to using `newSet.add()`

### 4. Invalid CSS Property Error
- **Issue**: `'ringColor' does not exist in type 'Properties...'`
- **Fix**: Changed from `ringColor` to using `outline` CSS property

### 5. Blank Video Preview
- **Issue**: Video preview area blank during recording
- **Fix**: Added `onloadedmetadata` handler, `cameraReady` state, loading spinner

### 6. Questions Not Visible (Required Scrolling)
- **Issue**: Users had to scroll to see questions while recording
- **Fix**: Complete redesign to single-screen layout with flex column

---

## Future Enhancements

### Potential Features
- Email notifications when new video is submitted
- Video transcription (Whisper API)
- AI-generated highlights/clips
- Export videos with branded overlays
- Custom domains for recording links
- Team collaboration (multiple users per account)
- Analytics dashboard (views, completion rates)
- A/B testing different prompts
- Webhook integrations (Zapier, etc.)
- White-label option

### Performance Improvements
- Video thumbnail generation
- Progressive video loading
- CDN optimization for playback

### UX Enhancements
- Practice mode before actual recording
- Teleprompter mode for prompts
- Background blur/virtual backgrounds
- Audio-only testimonials option

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 60+ |
| Safari | 14+ |
| Firefox | 55+ |
| Edge | 79+ |
| iOS Safari | 14.3+ |
| Chrome Android | 60+ |

---

## License

Private project - All rights reserved

---

**Built for high-ticket service providers who need powerful social proof.**
