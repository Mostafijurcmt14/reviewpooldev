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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          category: string | null
          external_id: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          category?: string | null
          external_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          category?: string | null
          external_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string | null
          user_id: string | null
          author_name: string
          author_email: string
          rating: number
          title: string | null
          content: string
          images: Json
          status: string
          is_verified_purchase: boolean
          sentiment_score: number | null
          sentiment_label: string | null
          ai_summary: string | null
          helpful_count: number
          report_count: number
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          user_id?: string | null
          author_name: string
          author_email: string
          rating: number
          title?: string | null
          content: string
          images?: Json
          status?: string
          is_verified_purchase?: boolean
          sentiment_score?: number | null
          sentiment_label?: string | null
          ai_summary?: string | null
          helpful_count?: number
          report_count?: number
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          user_id?: string | null
          author_name?: string
          author_email?: string
          rating?: number
          title?: string | null
          content?: string
          images?: Json
          status?: string
          is_verified_purchase?: boolean
          sentiment_score?: number | null
          sentiment_label?: string | null
          ai_summary?: string | null
          helpful_count?: number
          report_count?: number
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      review_responses: {
        Row: {
          id: string
          review_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          name: string
          type: string
          value: string
          description: string | null
          conditions: Json
          status: string
          valid_from: string
          valid_until: string | null
          usage_limit: number | null
          usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          value: string
          description?: string | null
          conditions?: Json
          status?: string
          valid_from?: string
          valid_until?: string | null
          usage_limit?: number | null
          usage_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          value?: string
          description?: string | null
          conditions?: Json
          status?: string
          valid_from?: string
          valid_until?: string | null
          usage_limit?: number | null
          usage_count?: number
          created_at?: string
        }
      }
      user_rewards: {
        Row: {
          id: string
          user_id: string | null
          reward_id: string
          review_id: string
          email: string
          status: string
          redeemed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          reward_id: string
          review_id: string
          email: string
          status?: string
          redeemed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          reward_id?: string
          review_id?: string
          email?: string
          status?: string
          redeemed_at?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          category: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          category?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          category?: string
          updated_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          name: string
          enabled: boolean
          config: Json
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          enabled?: boolean
          config?: Json
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          enabled?: boolean
          config?: Json
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics_daily: {
        Row: {
          id: string
          date: string
          total_reviews: number
          approved_reviews: number
          average_rating: number
          sentiment_positive: number
          sentiment_neutral: number
          sentiment_negative: number
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          total_reviews?: number
          approved_reviews?: number
          average_rating?: number
          sentiment_positive?: number
          sentiment_neutral?: number
          sentiment_negative?: number
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_reviews?: number
          approved_reviews?: number
          average_rating?: number
          sentiment_positive?: number
          sentiment_neutral?: number
          sentiment_negative?: number
          created_at?: string
        }
      }
    }
  }
}
