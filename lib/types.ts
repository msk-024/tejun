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
      procedures: {
        Row: {
          id: string
          title: string
          content: string
          category_id: string | null
          is_deleted: boolean
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string
          category_id?: string | null
          is_deleted?: boolean
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category_id?: string | null
          is_deleted?: boolean
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      procedure_histories: {
        Row: {
          id: string
          procedure_id: string | null
          title: string
          content: string
          category_id: string | null
          changed_by: string | null
          action: 'created' | 'updated' | 'deleted'
          changed_at: string
        }
        Insert: {
          id?: string
          procedure_id?: string | null
          title: string
          content?: string
          category_id?: string | null
          changed_by?: string | null
          action: 'created' | 'updated' | 'deleted'
          changed_at?: string
        }
        Update: never
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          is_deleted: boolean
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          is_deleted?: boolean
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          is_deleted?: boolean
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      category_histories: {
        Row: {
          id: string
          category_id: string | null
          name: string
          description: string
          changed_by: string | null
          action: 'created' | 'updated' | 'deleted'
          changed_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          description?: string
          changed_by?: string | null
          action: 'created' | 'updated' | 'deleted'
          changed_at?: string
        }
        Update: never
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

export type Procedure = Database['public']['Tables']['procedures']['Row']
export type ProcedureInsert = Database['public']['Tables']['procedures']['Insert']
export type ProcedureUpdate = Database['public']['Tables']['procedures']['Update']
export type ProcedureHistory = Database['public']['Tables']['procedure_histories']['Row']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type CategoryHistory = Database['public']['Tables']['category_histories']['Row']
