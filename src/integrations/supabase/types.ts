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
      appointments: {
        Row: {
          appointment_time: string
          barber_id: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          date: string
          duration_minutes: number
          id: string
          notes: string | null
          service_id: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_time: string
          barber_id?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          date: string
          duration_minutes: number
          id?: string
          notes?: string | null
          service_id?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_time?: string
          barber_id?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          date?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          service_id?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_availability: {
        Row: {
          barber_id: string | null
          created_at: string | null
          date: string
          end_time: string
          id: string
          is_available: boolean | null
          is_emergency_slot: boolean | null
          start_time: string
        }
        Insert: {
          barber_id?: string | null
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          is_available?: boolean | null
          is_emergency_slot?: boolean | null
          start_time: string
        }
        Update: {
          barber_id?: string | null
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          is_emergency_slot?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "barber_availability_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_ratings: {
        Row: {
          barber_id: string | null
          created_at: string | null
          customer_email: string
          id: string
          rating: number
          review: string | null
          style_category: string | null
        }
        Insert: {
          barber_id?: string | null
          created_at?: string | null
          customer_email: string
          id?: string
          rating: number
          review?: string | null
          style_category?: string | null
        }
        Update: {
          barber_id?: string | null
          created_at?: string | null
          customer_email?: string
          id?: string
          rating?: number
          review?: string | null
          style_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barber_ratings_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_schedules: {
        Row: {
          barber_id: string | null
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_working: boolean | null
          start_time: string
        }
        Insert: {
          barber_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_working?: boolean | null
          start_time: string
        }
        Update: {
          barber_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_working?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "barber_schedules_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_specializations: {
        Row: {
          barber_id: string | null
          created_at: string | null
          expertise_level: string
          id: string
          specialization: string
        }
        Insert: {
          barber_id?: string | null
          created_at?: string | null
          expertise_level: string
          id?: string
          specialization: string
        }
        Update: {
          barber_id?: string | null
          created_at?: string | null
          expertise_level?: string
          id?: string
          specialization?: string
        }
        Relationships: [
          {
            foreignKeyName: "barber_specializations_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barbers: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      barbershop_locations: {
        Row: {
          address: string
          city: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          postal_code: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_preferences: {
        Row: {
          created_at: string | null
          customer_email: string
          id: string
          notes: string | null
          preferred_barber_id: string | null
          preferred_style: string | null
          preferred_time_slot: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          id?: string
          notes?: string | null
          preferred_barber_id?: string | null
          preferred_style?: string | null
          preferred_time_slot?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          id?: string
          notes?: string | null
          preferred_barber_id?: string | null
          preferred_style?: string | null
          preferred_time_slot?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_preferences_preferred_barber_id_fkey"
            columns: ["preferred_barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_slots: {
        Row: {
          barber_id: string | null
          created_at: string | null
          date: string
          end_time: string
          id: string
          is_available: boolean | null
          priority_level: number | null
          start_time: string
        }
        Insert: {
          barber_id?: string | null
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          is_available?: boolean | null
          priority_level?: number | null
          start_time: string
        }
        Update: {
          barber_id?: string | null
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          priority_level?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_slots_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          id: string
          question: string
        }
        Insert: {
          answer: string
          category?: string | null
          id?: string
          question: string
        }
        Update: {
          answer?: string
          category?: string | null
          id?: string
          question?: string
        }
        Relationships: []
      }
      gift_cards: {
        Row: {
          amount: number
          card_number: string
          created_at: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          issued_date: string | null
          redeemed_amount: number | null
        }
        Insert: {
          amount: number
          card_number: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          issued_date?: string | null
          redeemed_amount?: number | null
        }
        Update: {
          amount?: number
          card_number?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          issued_date?: string | null
          redeemed_amount?: number | null
        }
        Relationships: []
      }
      group_bookings: {
        Row: {
          created_at: string | null
          group_leader_email: string
          group_size: number
          id: string
          preferred_date: string
          preferred_time_slot: string
          special_requests: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          group_leader_email: string
          group_size: number
          id?: string
          preferred_date: string
          preferred_time_slot: string
          special_requests?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          group_leader_email?: string
          group_size?: number
          id?: string
          preferred_date?: string
          preferred_time_slot?: string
          special_requests?: string | null
          status?: string
        }
        Relationships: []
      }
      product_inventory: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_available: boolean | null
          name: string
          price: number
          stock_quantity: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_available?: boolean | null
          name: string
          price: number
          stock_quantity?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          price?: number
          stock_quantity?: number
        }
        Relationships: []
      }
      promotions: {
        Row: {
          details: string | null
          id: string
          title: string | null
          valid_until: string | null
        }
        Insert: {
          details?: string | null
          id?: string
          title?: string | null
          valid_until?: string | null
        }
        Update: {
          details?: string | null
          id?: string
          title?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          name: string
          price: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
          price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      style_categories: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          maintenance_level: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          maintenance_level?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          maintenance_level?: string | null
          name?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string | null
          customer_name: string
          customer_phone: string
          estimated_wait_time: number | null
          id: string
          preferred_barber_id: string | null
          service_id: string | null
          status: string
          waitlist_time: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          customer_phone: string
          estimated_wait_time?: number | null
          id?: string
          preferred_barber_id?: string | null
          service_id?: string | null
          status: string
          waitlist_time?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          customer_phone?: string
          estimated_wait_time?: number | null
          id?: string
          preferred_barber_id?: string | null
          service_id?: string | null
          status?: string
          waitlist_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_preferred_barber_id_fkey"
            columns: ["preferred_barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      working_hours: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          holiday_name: string | null
          id: string
          is_holiday: boolean | null
          is_working: boolean | null
          location_id: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          holiday_name?: string | null
          id?: string
          is_holiday?: boolean | null
          is_working?: boolean | null
          location_id?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          holiday_name?: string | null
          id?: string
          is_holiday?: boolean | null
          is_working?: boolean | null
          location_id?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "barbershop_locations"
            referencedColumns: ["id"]
          },
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
