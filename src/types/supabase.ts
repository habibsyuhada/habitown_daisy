export interface Database {
  public: {
    Tables: {
      Account: {
        Row: {
          id: string;
          userId: string;
          type: string;
          provider: string;
          providerAccountId: string | null;
          refresh_token: string | null;
          access_token: string | null;
          expires_at: number | null;
          token_type: string | null;
          scope: string | null;
          id_token: string | null;
          session_state: string | null;
        };
        Insert: {
          id: string;
          userId: string;
          type: string;
          provider: string;
          providerAccountId?: string | null;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
        };
        Update: {
          id?: string;
          userId?: string;
          type?: string;
          provider?: string;
          providerAccountId?: string | null;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
        };
      };
      habit_categories: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          color: string | null;
          icon: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          frequency: string;
          target: number;
          uom: string;
          category_id: number | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          frequency: string;
          target?: number;
          uom?: string;
          category_id?: number | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          frequency?: string;
          target?: number;
          uom?: string;
          category_id?: number | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_records: {
        Row: {
          id: number;
          habit_id: number;
          date: string;
          value: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          habit_id: number;
          date: string;
          value?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          habit_id?: number;
          date?: string;
          value?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      Session: {
        Row: {
          id: string;
          sessionToken: string;
          userId: string;
          expires: string;
        };
        Insert: {
          id: string;
          sessionToken: string;
          userId: string;
          expires: string;
        };
        Update: {
          id?: string;
          sessionToken?: string;
          userId?: string;
          expires?: string;
        };
      };
      User: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          password: string | null;
          emailVerified: string | null;
          image: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email: string;
          password?: string | null;
          emailVerified?: string | null;
          image?: string | null;
          createdAt?: string;
          updatedAt: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string;
          password?: string | null;
          emailVerified?: string | null;
          image?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
    };
  };
} 