import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/campaigns - Get all campaigns for the current user
export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all campaigns for this user with video count
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        videos:videos(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    // Transform the response to include video_count
    const campaignsWithCount = campaigns.map(campaign => ({
      ...campaign,
      video_count: campaign.videos[0]?.count || 0,
      videos: undefined // Remove the nested array
    }))

    return NextResponse.json(campaignsWithCount)
  } catch (error) {
    console.error('Error in GET /api/campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, company_name, logo_url, brand_color, secondary_color, aspect_ratio, prompts } = body

    if (!name) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        name,
        company_name: company_name || null,
        logo_url: logo_url || null,
        brand_color: brand_color || '#4F46E5',
        secondary_color: secondary_color || '#1E293B',
        aspect_ratio: aspect_ratio || 'portrait',
        prompts: prompts || [
          'What was your biggest challenge before working with us?',
          'How did we help you overcome it?',
          'What results have you seen since?'
        ]
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign:', error)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
