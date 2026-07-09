export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ceremonies: {
        Row: {
          capacity: number | null
          color: string | null
          created_at: string
          date: string | null
          dress_code: string | null
          id: string
          label: string
          maps_url: string | null
          name: string
          notes: string | null
          program: Json
          public_slug: string
          sort_order: number
          status: string
          time_end: string | null
          time_start: string | null
          type: string
          venue: string | null
          wedding_id: string
        }
        Insert: {
          capacity?: number | null
          color?: string | null
          created_at?: string
          date?: string | null
          dress_code?: string | null
          id?: string
          label: string
          maps_url?: string | null
          name: string
          notes?: string | null
          program?: Json
          public_slug?: string
          sort_order?: number
          status?: string
          time_end?: string | null
          time_start?: string | null
          type: string
          venue?: string | null
          wedding_id: string
        }
        Update: {
          capacity?: number | null
          color?: string | null
          created_at?: string
          date?: string | null
          dress_code?: string | null
          id?: string
          label?: string
          maps_url?: string | null
          name?: string
          notes?: string | null
          program?: Json
          public_slug?: string
          sort_order?: number
          status?: string
          time_end?: string | null
          time_start?: string | null
          type?: string
          venue?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ceremonies_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          allowed_plus_ones: number
          ceremony_ids: string[]
          created_at: string
          email: string | null
          group_name: string | null
          guest_type: string
          id: string
          message: string | null
          name: string
          phone: string | null
          rsvps: Json
          source: string
          wedding_id: string
        }
        Insert: {
          allowed_plus_ones?: number
          ceremony_ids?: string[]
          created_at?: string
          email?: string | null
          group_name?: string | null
          guest_type?: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          rsvps?: Json
          source?: string
          wedding_id: string
        }
        Update: {
          allowed_plus_ones?: number
          ceremony_ids?: string[]
          created_at?: string
          email?: string | null
          group_name?: string | null
          guest_type?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          rsvps?: Json
          source?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          attending: boolean
          ceremony_id: string | null
          companions: number
          created_at: string
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          message: string | null
          wedding_id: string
        }
        Insert: {
          attending: boolean
          ceremony_id?: string | null
          companions?: number
          created_at?: string
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          message?: string | null
          wedding_id: string
        }
        Update: {
          attending?: boolean
          ceremony_id?: string | null
          companions?: number
          created_at?: string
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          message?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_ceremony_id_fkey"
            columns: ["ceremony_id"]
            isOneToOne: false
            referencedRelation: "ceremonies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          accent: string | null
          bride_name: string
          caption: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          countdown_enabled: boolean
          countdown_units: string[]
          couple_story: string | null
          created_at: string
          custom_info_body: string | null
          custom_info_title: string | null
          dress_code_note: string | null
          event_type: string
          groom_name: string
          has_envelope_animation: boolean
          hashtag: string | null
          hero_image_url: string | null
          id: string
          intro_message: string | null
          is_locked: boolean
          is_published: boolean
          onboarding_step: number
          owner_id: string
          practical_accommodation: string | null
          practical_contact_name: string | null
          practical_contact_phone: string | null
          practical_info_enabled: boolean
          practical_parking: string | null
          published_at: string | null
          slug: string | null
          template_id: string
          theme: string
          updated_at: string
          wedding_date: string | null
        }
        Insert: {
          accent?: string | null
          bride_name?: string
          caption?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          countdown_enabled?: boolean
          countdown_units?: string[]
          couple_story?: string | null
          created_at?: string
          custom_info_body?: string | null
          custom_info_title?: string | null
          dress_code_note?: string | null
          event_type?: string
          groom_name?: string
          has_envelope_animation?: boolean
          hashtag?: string | null
          hero_image_url?: string | null
          id?: string
          intro_message?: string | null
          is_locked?: boolean
          is_published?: boolean
          onboarding_step?: number
          owner_id: string
          practical_accommodation?: string | null
          practical_contact_name?: string | null
          practical_contact_phone?: string | null
          practical_info_enabled?: boolean
          practical_parking?: string | null
          published_at?: string | null
          slug?: string | null
          template_id?: string
          theme?: string
          updated_at?: string
          wedding_date?: string | null
        }
        Update: {
          accent?: string | null
          bride_name?: string
          caption?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          countdown_enabled?: boolean
          countdown_units?: string[]
          couple_story?: string | null
          created_at?: string
          custom_info_body?: string | null
          custom_info_title?: string | null
          dress_code_note?: string | null
          event_type?: string
          groom_name?: string
          has_envelope_animation?: boolean
          hashtag?: string | null
          hero_image_url?: string | null
          id?: string
          intro_message?: string | null
          is_locked?: boolean
          is_published?: boolean
          onboarding_step?: number
          owner_id?: string
          practical_accommodation?: string | null
          practical_contact_name?: string | null
          practical_contact_phone?: string | null
          practical_info_enabled?: boolean
          practical_parking?: string | null
          published_at?: string | null
          slug?: string | null
          template_id?: string
          theme?: string
          updated_at?: string
          wedding_date?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
