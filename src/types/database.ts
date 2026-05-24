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
      students: {
        Row: {
          id: string
          user_id: string
          full_name: string
          nickname: string | null
          bio: string | null
          favorite_quote: string | null
          avatar_url: string | null
          instagram_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          birthday: string | null
          is_admin: boolean
          is_active: boolean
          likes_count: number
          mentions_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          nickname?: string | null
          bio?: string | null
          favorite_quote?: string | null
          avatar_url?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          birthday?: string | null
          is_admin?: boolean
          is_active?: boolean
          likes_count?: number
          mentions_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      anonymous_messages: {
        Row: {
          id: string
          content: string
          message_type: 'confession' | 'compliment' | 'secret' | 'funny' | 'secret_admirer'
          is_approved: boolean
          is_flagged: boolean
          is_featured: boolean
          likes_count: number
          laughs_count: number
          fire_count: number
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          message_type: 'confession' | 'compliment' | 'secret' | 'funny' | 'secret_admirer'
          is_approved?: boolean
          is_flagged?: boolean
          is_featured?: boolean
          likes_count?: number
          laughs_count?: number
          fire_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['anonymous_messages']['Insert']>
      }
      reactions: {
        Row: {
          id: string
          user_id: string
          message_id: string
          reaction_type: 'like' | 'laugh' | 'fire'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_id: string
          reaction_type: 'like' | 'laugh' | 'fire'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['reactions']['Insert']>
      }
      polls: {
        Row: {
          id: string
          question: string
          created_by: string
          is_active: boolean
          ends_at: string | null
          total_votes: number
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          created_by: string
          is_active?: boolean
          ends_at?: string | null
          total_votes?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['polls']['Insert']>
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          option_text: string
          votes_count: number
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_text: string
          votes_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['poll_options']['Insert']>
      }
      poll_votes: {
        Row: {
          id: string
          poll_id: string
          option_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_id: string
          user_id: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['poll_votes']['Insert']>
      }
      gallery_uploads: {
        Row: {
          id: string
          uploaded_by: string
          caption: string | null
          image_url: string
          category: 'academic' | 'fieldtrip' | 'social' | 'graduation' | 'misc'
          likes_count: number
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          uploaded_by: string
          caption?: string | null
          image_url: string
          category?: 'academic' | 'fieldtrip' | 'social' | 'graduation' | 'misc'
          likes_count?: number
          is_approved?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['gallery_uploads']['Insert']>
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          created_by: string
          is_pinned: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_by: string
          is_pinned?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          event_type: 'academic' | 'social' | 'fieldtrip' | 'exam' | 'graduation'
          location: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          event_type?: 'academic' | 'social' | 'fieldtrip' | 'exam' | 'graduation'
          location?: string | null
          created_by: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      profile_likes: {
        Row: {
          id: string
          liker_id: string
          liked_student_id: string
          created_at: string
        }
        Insert: {
          id?: string
          liker_id: string
          liked_student_id: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profile_likes']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      message_type: 'confession' | 'compliment' | 'secret' | 'funny' | 'secret_admirer'
      reaction_type: 'like' | 'laugh' | 'fire'
      gallery_category: 'academic' | 'fieldtrip' | 'social' | 'graduation' | 'misc'
      event_type: 'academic' | 'social' | 'fieldtrip' | 'exam' | 'graduation'
    }
  }
}

// Convenience types
export type Student = Database['public']['Tables']['students']['Row']
export type AnonMessage = Database['public']['Tables']['anonymous_messages']['Row']
export type Poll = Database['public']['Tables']['polls']['Row']
export type PollOption = Database['public']['Tables']['poll_options']['Row']
export type GalleryUpload = Database['public']['Tables']['gallery_uploads']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type Event = Database['public']['Tables']['events']['Row']
