import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/videos - Create a new video record
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const {
      campaign_id,
      video_url,
      thumbnail_url,
      submitter_name,
      submitter_email,
      duration
    } = body

    if (!campaign_id || !video_url) {
      return NextResponse.json(
        { error: 'campaign_id and video_url are required' },
        { status: 400 }
      )
    }

    // Verify the campaign exists
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Insert the video record
    const { data: video, error } = await supabase
      .from('videos')
      .insert({
        campaign_id,
        video_url,
        thumbnail_url: thumbnail_url || null,
        submitter_name: submitter_name || null,
        submitter_email: submitter_email || null,
        duration: duration || null,
        status: 'ready' // Mark as ready since Cloudinary handles processing
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating video:', error)
      return NextResponse.json({ error: 'Failed to save video' }, { status: 500 })
    }

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/videos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/videos - Get videos for a campaign (requires auth)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')

    if (!campaignId) {
      return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 })
    }

    // Verify user owns this campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get all videos for this campaign
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching videos:', error)
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error in GET /api/videos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
