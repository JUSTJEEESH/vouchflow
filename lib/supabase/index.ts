// Re-export types
export type { Database, Campaign, CampaignInsert, Video, VideoInsert } from './types'

// Export client creation functions
export { createClient } from './client'
export { createClient as createServerClient, createServiceClient } from './server'
