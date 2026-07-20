export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      trusts: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          website_url: string | null
          sort_order: number
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          website_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          website_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      institutes: {
        Row: {
          id: string
          trust_id: string
          name: string
          slug: string
          logo_url: string | null
          website_url: string | null
          sort_order: number
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          trust_id: string
          name: string
          slug: string
          logo_url?: string | null
          website_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          trust_id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          website_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      colleges: {
        Row: {
          id: string
          institute_id: string | null
          name: string
          slug: string
          code: string | null
          short_code: string | null
          tagline: string | null
          logo_url: string | null
          website_url: string | null
          sort_order: number
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          institute_id?: string | null
          name: string
          slug: string
          code?: string | null
          short_code?: string | null
          tagline?: string | null
          logo_url?: string | null
          website_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          institute_id?: string | null
          name?: string
          slug?: string
          code?: string | null
          short_code?: string | null
          tagline?: string | null
          logo_url?: string | null
          website_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          college_id: string
          name: string
          slug: string
          code: string
          head_of_department_id: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          college_id: string
          name: string
          slug: string
          code: string
          head_of_department_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          college_id?: string
          name?: string
          slug?: string
          code?: string
          head_of_department_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          department_id: string | null
          name: string
          code: string
          degree_level: Database["public"]["Enums"]["degree_level"]
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          department_id?: string | null
          name: string
          code: string
          degree_level: Database["public"]["Enums"]["degree_level"]
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          department_id?: string | null
          name?: string
          code?: string
          degree_level?: Database["public"]["Enums"]["degree_level"]
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      branches: {
        Row: {
          id: string
          course_id: string
          name: string
          code: string
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          course_id: string
          name: string
          code: string
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          course_id?: string
          name?: string
          code?: string
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          id: string
          user_id: string | null
          title: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          bio: string | null
          office_hours: Json
          social_links: Json
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          user_id?: string | null
          title?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          office_hours?: Json
          social_links?: Json
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          office_hours?: Json
          social_links?: Json
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      designations: {
        Row: {
          id: string
          title: string
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          title: string
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          title?: string
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      staff_department_assignments: {
        Row: {
          id: string
          staff_id: string
          department_id: string
          designation_id: string | null
          is_primary: boolean
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          staff_id: string
          department_id: string
          designation_id?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          staff_id?: string
          department_id?: string
          designation_id?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      homepage_items: {
        Row: {
          id: string
          scope_type: Database["public"]["Enums"]["scope_level"]
          department_id: string | null
          item_type: string
          eyebrow: string | null
          title: string
          title_accent: string | null
          subtitle: string | null
          body: string | null
          image_url: string | null
          icon_name: string | null
          link_href: string | null
          link_label: string | null
          secondary_link_href: string | null
          secondary_link_label: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          scope_type?: Database["public"]["Enums"]["scope_level"]
          department_id?: string | null
          item_type: string
          eyebrow?: string | null
          title: string
          title_accent?: string | null
          subtitle?: string | null
          body?: string | null
          image_url?: string | null
          icon_name?: string | null
          link_href?: string | null
          link_label?: string | null
          secondary_link_href?: string | null
          secondary_link_label?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          scope_type?: Database["public"]["Enums"]["scope_level"]
          department_id?: string | null
          item_type?: string
          eyebrow?: string | null
          title?: string
          title_accent?: string | null
          subtitle?: string | null
          body?: string | null
          image_url?: string | null
          icon_name?: string | null
          link_href?: string | null
          link_label?: string | null
          secondary_link_href?: string | null
          secondary_link_label?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          id: string
          scope_type: Database["public"]["Enums"]["scope_level"]
          department_id: string | null
          title: string | null
          section_type: string
          sort_order: number
          is_active: boolean
          config: Json
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          scope_type?: Database["public"]["Enums"]["scope_level"]
          department_id?: string | null
          title?: string | null
          section_type: string
          sort_order?: number
          is_active?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          scope_type?: Database["public"]["Enums"]["scope_level"]
          department_id?: string | null
          title?: string | null
          section_type?: string
          sort_order?: number
          is_active?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      homepage_widgets: {
        Row: {
          id: string
          section_id: string
          title: string | null
          widget_type: string
          config: Json
          sort_order: number
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          section_id: string
          title?: string | null
          widget_type: string
          config?: Json
          sort_order?: number
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          section_id?: string
          title?: string | null
          widget_type?: string
          config?: Json
          sort_order?: number
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          scope_type: Database["public"]["Enums"]["scope_level"]
          department_id: string | null
          title: string
          slug: string
          summary: string | null
          content: string | null
          featured_image_url: string | null
          category_id: string | null
          is_featured: boolean
          published_at: string | null
          expires_at: string | null
          seo_id: string | null
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          scope_type?: Database["public"]["Enums"]["scope_level"]
          department_id?: string | null
          title: string
          slug: string
          summary?: string | null
          content?: string | null
          featured_image_url?: string | null
          category_id?: string | null
          is_featured?: boolean
          published_at?: string | null
          expires_at?: string | null
          seo_id?: string | null
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          scope_type?: Database["public"]["Enums"]["scope_level"]
          department_id?: string | null
          title?: string
          slug?: string
          summary?: string | null
          content?: string | null
          featured_image_url?: string | null
          category_id?: string | null
          is_featured?: boolean
          published_at?: string | null
          expires_at?: string | null
          seo_id?: string | null
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          scope_type: Database["public"]["Enums"]["scope_level"]
          department_id: string | null
          title: string
          slug: string | null
          description: string | null
          tag: string | null
          start_date: string | null
          end_date: string | null
          location: string | null
          map_url: string | null
          registration_link: string | null
          featured_image_url: string | null
          sort_order: number
          seo_id: string | null
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["event_status"] | Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          scope_type?: Database["public"]["Enums"]["scope_level"]
          department_id?: string | null
          title: string
          slug?: string | null
          description?: string | null
          tag?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          map_url?: string | null
          registration_link?: string | null
          featured_image_url?: string | null
          sort_order?: number
          seo_id?: string | null
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["event_status"] | Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          scope_type?: Database["public"]["Enums"]["scope_level"]
          department_id?: string | null
          title?: string
          slug?: string | null
          description?: string | null
          tag?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          map_url?: string | null
          registration_link?: string | null
          featured_image_url?: string | null
          sort_order?: number
          seo_id?: string | null
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["event_status"] | Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      recruiters: {
        Row: {
          id: string
          company_name: string | null
          name: string | null
          logo_url: string | null
          website_url: string | null
          sort_order: number
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          company_name?: string | null
          name?: string | null
          logo_url?: string | null
          website_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          company_name?: string | null
          name?: string | null
          logo_url?: string | null
          website_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      placement_statistics: {
        Row: {
          id: string
          academic_year: string
          total_students: number
          placed_students: number
          highest_package: number | null
          average_package: number | null
          recruiters_count: number | null
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          academic_year: string
          total_students: number
          placed_students: number
          highest_package?: number | null
          average_package?: number | null
          recruiters_count?: number | null
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          academic_year?: string
          total_students?: number
          placed_students?: number
          highest_package?: number | null
          average_package?: number | null
          recruiters_count?: number | null
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      downloads: {
        Row: {
          id: string
          title: string
          file_url: string
          file_type: string | null
          file_size: number | null
          category: string
          publish_date: string
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          title: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          category: string
          publish_date?: string
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          title?: string
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          category?: string
          publish_date?: string
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      inquiry_forms: {
        Row: {
          id: string
          form_name: string
          fields_config: Json
          recipient_emails: string[]
          created_at: string
          updated_at: string
          status: Database["public"]["Enums"]["content_status"]
          metadata: Json
        }
        Insert: {
          id?: string
          form_name: string
          fields_config?: Json
          recipient_emails?: string[]
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Update: {
          id?: string
          form_name?: string
          fields_config?: Json
          recipient_emails?: string[]
          created_at?: string
          updated_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          metadata?: Json
        }
        Relationships: []
      }
      inquiry_submissions: {
        Row: {
          id: string
          form_id: string | null
          form_name: string | null
          submitted_data: Json
          status: Database["public"]["Enums"]["submission_status"]
          notes: string | null
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          form_id?: string | null
          form_name?: string | null
          submitted_data: Json
          status?: Database["public"]["Enums"]["submission_status"]
          notes?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          form_id?: string | null
          form_name?: string | null
          submitted_data?: Json
          status?: Database["public"]["Enums"]["submission_status"]
          notes?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string
          old_values: Json | null
          new_values: Json | null
          client_ip: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id: string
          old_values?: Json | null
          new_values?: Json | null
          client_ip?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string
          old_values?: Json | null
          new_values?: Json | null
          client_ip?: string | null
          user_agent?: string | null
          created_at?: string
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
      content_status: "draft" | "published" | "archived"
      degree_level: "undergraduate" | "graduate" | "doctorate" | "certificate"
      event_status: "draft" | "published" | "cancelled"
      facility_type: "campus" | "building" | "laboratory"
      link_type: "internal" | "external"
      scope_level: "global" | "trust" | "institute" | "college" | "department"
      staff_type: "faculty" | "office_staff"
      submission_status: "unread" | "read" | "replied"
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

export const Constants = {
  public: {
    Enums: {
      content_status: ["draft", "published", "archived"],
      degree_level: ["undergraduate", "graduate", "doctorate", "certificate"],
      event_status: ["draft", "published", "cancelled"],
      facility_type: ["campus", "building", "laboratory"],
      link_type: ["internal", "external"],
      scope_level: ["global", "trust", "institute", "college", "department"],
      staff_type: ["faculty", "office_staff"],
      submission_status: ["unread", "read", "replied"],
    },
  },
} as const
