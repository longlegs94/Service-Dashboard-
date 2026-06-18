/**
 * Database types for the Supabase Postgres schema.
 *
 * Phase 0: hand-authored to cover the foundation tables. Once the Supabase
 * project is linked you can regenerate the full, always-accurate version with:
 *
 *   supabase gen types typescript --linked > src/types/database.types.ts
 *
 * Keep the `Database` export name stable so src/lib/supabase.ts keeps compiling.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MembershipRole = "owner" | "admin" | "member";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          owner_user_id: string;
          timezone: string;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_user_id: string;
          timezone?: string;
          currency?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: MembershipRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: MembershipRole;
        };
        Update: Partial<Database["public"]["Tables"]["memberships"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_org_member: {
        Args: { target_org_id: string };
        Returns: boolean;
      };
      has_org_role: {
        Args: { target_org_id: string; allowed_roles: string[] };
        Returns: boolean;
      };
    };
    Enums: {
      membership_role: MembershipRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
