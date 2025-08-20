export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          active_org_id: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          active_org_id?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          active_org_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_active_org_id_fkey';
            columns: ['active_org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
        ];
      };
      orgs: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orgs_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          org_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          org_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'memberships_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'memberships_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
        ];
      };
      invites: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          role: string;
          status: string;
          token: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          email: string;
          role?: string;
          status?: string;
          token: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          email?: string;
          role?: string;
          status?: string;
          token?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invites_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'orgs';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
