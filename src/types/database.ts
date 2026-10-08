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
          user_code: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_code?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_code?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'cash' | 'bank' | 'credit_card'
          bank_name: string | null
          balance: number
          credit_limit: number | null
          cutoff_day: number | null
          due_day: number | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'cash' | 'bank' | 'credit_card'
          bank_name?: string | null
          balance?: number
          credit_limit?: number | null
          cutoff_day?: number | null
          due_day?: number | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'cash' | 'bank' | 'credit_card'
          bank_name?: string | null
          balance?: number
          credit_limit?: number | null
          cutoff_day?: number | null
          due_day?: number | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          amount: number
          description: string
          category: string
          transaction_date: string
          is_private: boolean
          installment_group_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          amount: number
          description: string
          category: string
          transaction_date?: string
          is_private?: boolean
          installment_group_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          amount?: number
          description?: string
          category?: string
          transaction_date?: string
          is_private?: boolean
          installment_group_id?: string | null
          created_at?: string
        }
      }
      installment_plans: {
        Row: {
          id: string
          user_id: string
          account_id: string
          transaction_id: string | null
          installment_group_id: string
          total_amount: number
          installment_count: number
          current_installment: number
          installment_amount: number
          due_month_year: string
          due_date: string
          status: 'upcoming' | 'paid'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          transaction_id?: string | null
          installment_group_id: string
          total_amount: number
          installment_count: number
          current_installment: number
          installment_amount: number
          due_month_year: string
          due_date: string
          status?: 'upcoming' | 'paid'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          transaction_id?: string | null
          installment_group_id?: string
          total_amount?: number
          installment_count?: number
          current_installment?: number
          installment_amount?: number
          due_month_year?: string
          due_date?: string
          status?: 'upcoming' | 'paid'
          created_at?: string
        }
      }
      recurring_expenses: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          title: string
          amount: number
          category: string
          day_of_month: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          title: string
          amount: number
          category?: string
          day_of_month: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          title?: string
          amount?: number
          category?: string
          day_of_month?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      social_feed_view: {
        Row: {
          transaction_id: string
          user_id: string
          user_name: string | null
          user_code: string
          avatar_url: string | null
          amount: number
          description: string
          category: string
          transaction_date: string
          created_at: string
        }
      }
    }
    Functions: {
      generate_unique_user_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      are_friends: {
        Args: {
          user1_id: string
          user2_id: string
        }
        Returns: boolean
      }
    }
  }
}
