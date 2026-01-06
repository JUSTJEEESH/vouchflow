export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          company_name: string | null
          logo_url: string | null
          brand_color: string
          prompts: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          company_name?: string | null
          logo_url?: string | null
          brand_color?: string
          prompts?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          company_name?: string | null
          logo_url?: string | null
          brand_color?: string
          prompts?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          id: string
          campaign_id: string
          video_url: string
          thumbnail_url: string | null
          submitter_name: string | null
          submitter_email: string | null
          duration: number | null
          status: 'processing' | 'ready' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          video_url: string
          thumbnail_url?: string | null
          submitter_name?: string | null
          submitter_email?: string | null
          duration?: number | null
          status?: 'processing' | 'ready' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          video_url?: string
          thumbnail_url?: string | null
          submitter_name?: string | null
          submitter_email?: string | null
          duration?: number | null
          status?: 'processing' | 'ready' | 'failed'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'videos_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      video_status: 'processing' | 'ready' | 'failed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
export type Video = Database['public']['Tables']['videos']['Row']
export type VideoInsert = Database['public']['Tables']['videos']['Insert']
