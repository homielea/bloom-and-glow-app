export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_checkins: {
        Row: {
          body_temperature: string
          body_temperature_source: string | null
          created_at: string
          date: string
          energy: number
          energy_source: string | null
          id: string
          libido: number
          mood: number
          mood_source: string | null
          notes: string | null
          sleep: number
          sleep_source: string | null
          stress: number
          stress_source: string | null
          tracker_hrv: number | null
          tracker_resting_hr: number | null
          tracker_sleep_score: number | null
          user_id: string
        }
        Insert: {
          body_temperature: string
          body_temperature_source?: string | null
          created_at?: string
          date: string
          energy: number
          energy_source?: string | null
          id?: string
          libido: number
          mood: number
          mood_source?: string | null
          notes?: string | null
          sleep: number
          sleep_source?: string | null
          stress: number
          stress_source?: string | null
          tracker_hrv?: number | null
          tracker_resting_hr?: number | null
          tracker_sleep_score?: number | null
          user_id: string
        }
        Update: {
          body_temperature?: string
          body_temperature_source?: string | null
          created_at?: string
          date?: string
          energy?: number
          energy_source?: string | null
          id?: string
          libido?: number
          mood?: number
          mood_source?: string | null
          notes?: string | null
          sleep?: number
          sleep_source?: string | null
          stress?: number
          stress_source?: string | null
          tracker_hrv?: number | null
          tracker_resting_hr?: number | null
          tracker_sleep_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      expert_profiles: {
        Row: {
          bio: string | null
          created_at: string
          credentials: string
          id: string
          professional_title: string
          specialization: string[] | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          credentials: string
          id?: string
          professional_title: string
          specialization?: string[] | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          credentials?: string
          id?: string
          professional_title?: string
          specialization?: string[] | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          forum_id: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          like_count: number | null
          reply_count: number | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          forum_id?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          reply_count?: number | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          forum_id?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          reply_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          is_solution: boolean | null
          like_count: number | null
          parent_reply_id: string | null
          post_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_solution?: boolean | null
          like_count?: number | null
          parent_reply_id?: string | null
          post_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_solution?: boolean | null
          like_count?: number | null
          parent_reply_id?: string | null
          post_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_expert_moderated: boolean | null
          member_count: number | null
          post_count: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_expert_moderated?: boolean | null
          member_count?: number | null
          post_count?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_expert_moderated?: boolean | null
          member_count?: number | null
          post_count?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_memberships: {
        Row: {
          group_id: string | null
          id: string
          joined_at: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "support_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          message: string
          message_type: string | null
          reply_to_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          message: string
          message_type?: string | null
          reply_to_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          message?: string
          message_type?: string | null
          reply_to_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "support_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "group_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      health_tracker_connections: {
        Row: {
          access_token: string
          connected_at: string
          created_at: string
          device_id: string | null
          device_name: string | null
          id: string
          last_sync_at: string | null
          provider: string
          refresh_token: string | null
          settings: Json | null
          sync_error_message: string | null
          sync_status: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          connected_at?: string
          created_at?: string
          device_id?: string | null
          device_name?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          refresh_token?: string | null
          settings?: Json | null
          sync_error_message?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          connected_at?: string
          created_at?: string
          device_id?: string | null
          device_name?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string | null
          settings?: Json | null
          sync_error_message?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_tracker_data: {
        Row: {
          connection_id: string
          created_at: string
          data_type: string
          id: string
          metadata: Json | null
          raw_data: Json | null
          recorded_date: string
          recorded_time: string | null
          value: number | null
        }
        Insert: {
          connection_id: string
          created_at?: string
          data_type: string
          id?: string
          metadata?: Json | null
          raw_data?: Json | null
          recorded_date: string
          recorded_time?: string | null
          value?: number | null
        }
        Update: {
          connection_id?: string
          created_at?: string
          data_type?: string
          id?: string
          metadata?: Json | null
          raw_data?: Json | null
          recorded_date?: string
          recorded_time?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_tracker_data_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "health_tracker_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      health_tracker_sync_logs: {
        Row: {
          connection_id: string
          created_at: string
          error_message: string | null
          id: string
          records_synced: number | null
          sync_completed_at: string | null
          sync_started_at: string
          sync_status: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          records_synced?: number | null
          sync_completed_at?: string | null
          sync_started_at?: string
          sync_status: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          records_synced?: number | null
          sync_completed_at?: string | null
          sync_started_at?: string
          sync_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_tracker_sync_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "health_tracker_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allow_anonymous_posting: boolean | null
          community_bio: string | null
          community_display_name: string | null
          created_at: string
          email: string
          id: string
          is_community_moderator: boolean | null
          onboarding_completed: boolean | null
          persona_description: string | null
          persona_learning_path: Json | null
          persona_motivational_tone: string | null
          persona_type: string | null
          updated_at: string
        }
        Insert: {
          allow_anonymous_posting?: boolean | null
          community_bio?: string | null
          community_display_name?: string | null
          created_at?: string
          email: string
          id: string
          is_community_moderator?: boolean | null
          onboarding_completed?: boolean | null
          persona_description?: string | null
          persona_learning_path?: Json | null
          persona_motivational_tone?: string | null
          persona_type?: string | null
          updated_at?: string
        }
        Update: {
          allow_anonymous_posting?: boolean | null
          community_bio?: string | null
          community_display_name?: string | null
          created_at?: string
          email?: string
          id?: string
          is_community_moderator?: boolean | null
          onboarding_completed?: boolean | null
          persona_description?: string | null
          persona_learning_path?: Json | null
          persona_motivational_tone?: string | null
          persona_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer_value: Json
          created_at: string
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          answer_value: Json
          created_at?: string
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          answer_value?: Json
          created_at?: string
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: []
      }
      support_groups: {
        Row: {
          created_at: string
          created_by: string | null
          current_members: number | null
          description: string | null
          group_type: string
          id: string
          max_members: number | null
          moderator_ids: string[] | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_members?: number | null
          description?: string | null
          group_type: string
          id?: string
          max_members?: number | null
          moderator_ids?: string[] | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_members?: number | null
          description?: string | null
          group_type?: string
          id?: string
          max_members?: number | null
          moderator_ids?: string[] | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string | null
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
