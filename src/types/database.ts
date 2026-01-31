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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string | null
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          active: boolean
          blocked_at: string
          blocked_by: string | null
          expires_at: string | null
          id: string
          ip_address: string
          reason: string | null
        }
        Insert: {
          active?: boolean
          blocked_at?: string
          blocked_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          reason?: string | null
        }
        Update: {
          active?: boolean
          blocked_at?: string
          blocked_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          reason?: string | null
        }
        Relationships: []
      }
      blog_articles: {
        Row: {
          author: string
          category: string
          content: string | null
          created_at: string
          excerpt: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          original_url: string | null
          published: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          original_url?: string | null
          published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          original_url?: string | null
          published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          published: boolean | null
          published_at: string | null
          read_time: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      broken_links: {
        Row: {
          first_seen_at: string
          hit_count: number
          id: string
          last_seen_at: string
          notes: string | null
          path: string
          referrer: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_to: string | null
          user_agent: string | null
        }
        Insert: {
          first_seen_at?: string
          hit_count?: number
          id?: string
          last_seen_at?: string
          notes?: string | null
          path: string
          referrer?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_to?: string | null
          user_agent?: string | null
        }
        Update: {
          first_seen_at?: string
          hit_count?: number
          id?: string
          last_seen_at?: string
          notes?: string | null
          path?: string
          referrer?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_to?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          count: number | null
          created_at: string
          id: string
          name: string
          pole_id: string | null
          slug: string
        }
        Insert: {
          count?: number | null
          created_at?: string
          id?: string
          name: string
          pole_id?: string | null
          slug: string
        }
        Update: {
          count?: number | null
          created_at?: string
          id?: string
          name?: string
          pole_id?: string | null
          slug?: string
        }
        Relationships: []
      }
      category_specialite_mapping: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          specialite_name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          specialite_name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          specialite_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_specialite_mapping_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_analytics: {
        Row: {
          created_at: string
          id: string
          node_id: string
          option_id: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          node_id: string
          option_id?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          node_id?: string
          option_id?: string | null
          session_id?: string
        }
        Relationships: []
      }
      chat_nodes: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_end: boolean | null
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id: string
          is_end?: boolean | null
          message: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_end?: boolean | null
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_options: {
        Row: {
          action_type: string | null
          action_value: string | null
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          label: string
          next_node_id: string | null
          node_id: string
        }
        Insert: {
          action_type?: string | null
          action_value?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          label: string
          next_node_id?: string | null
          node_id: string
        }
        Update: {
          action_type?: string | null
          action_value?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          label?: string
          next_node_id?: string | null
          node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_options_next_node_id_fkey"
            columns: ["next_node_id"]
            isOneToOne: false
            referencedRelation: "chat_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_options_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "chat_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          active: boolean | null
          created_at: string | null
          department: string | null
          department_code: string | null
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          population: number | null
          region: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          department?: string | null
          department_code?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          population?: number | null
          region?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          department?: string | null
          department_code?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          population?: number | null
          region?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      city_services: {
        Row: {
          active: boolean | null
          city_id: string
          created_at: string | null
          custom_content: string | null
          custom_description: string | null
          custom_title: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          service_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          city_id: string
          created_at?: string | null
          custom_content?: string | null
          custom_description?: string | null
          custom_title?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          service_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          city_id?: string
          created_at?: string | null
          custom_content?: string | null
          custom_description?: string | null
          custom_title?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_services_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          client_id: string
          created_at: string | null
          email: string
          fonction: string
          id: string
          is_primary: boolean | null
          nom: string
          prenom: string
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          email: string
          fonction?: string
          id?: string
          is_primary?: boolean | null
          nom: string
          prenom: string
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          email?: string
          fonction?: string
          id?: string
          is_primary?: boolean | null
          nom?: string
          prenom?: string
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
        ]
      }
      client_departments: {
        Row: {
          active: boolean | null
          client_id: string
          code: string | null
          created_at: string | null
          description: string | null
          id: string
          manager_user_id: string | null
          name: string
          parent_department_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          client_id: string
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          manager_user_id?: string | null
          name: string
          parent_department_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          client_id?: string
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          manager_user_id?: string | null
          name?: string
          parent_department_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_departments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_departments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "client_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["department_id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          client_role: string | null
          created_at: string | null
          departed_at: string | null
          department: string | null
          department_id: string | null
          departure_reason: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_primary: boolean | null
          managed_agency_ids: string[] | null
          role: string
          scope_all_agencies: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          client_role?: string | null
          created_at?: string | null
          departed_at?: string | null
          department?: string | null
          department_id?: string | null
          departure_reason?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_primary?: boolean | null
          managed_agency_ids?: string[] | null
          role?: string
          scope_all_agencies?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          client_role?: string | null
          created_at?: string | null
          departed_at?: string | null
          department?: string | null
          department_id?: string | null
          departure_reason?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_primary?: boolean | null
          managed_agency_ids?: string[] | null
          role?: string
          scope_all_agencies?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "client_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["department_id"]
          },
        ]
      }
      clients: {
        Row: {
          active: boolean
          adresse: string | null
          client_type: string | null
          code_postal: string | null
          contact_email: string | null
          contact_nom: string | null
          contact_prenom: string | null
          contact_telephone: string | null
          created_at: string
          effectif_entreprise: string | null
          email: string | null
          forme_juridique: string | null
          id: string
          naf_code: string | null
          nom: string
          notes: string | null
          organization_id: string | null
          parent_client_id: string | null
          questionnaire_completed_at: string | null
          questionnaire_token: string | null
          region: string | null
          siren: string | null
          siret: string | null
          telephone: string | null
          tva_intracommunautaire: string | null
          updated_at: string
          ville: string | null
          website: string | null
        }
        Insert: {
          active?: boolean
          adresse?: string | null
          client_type?: string | null
          code_postal?: string | null
          contact_email?: string | null
          contact_nom?: string | null
          contact_prenom?: string | null
          contact_telephone?: string | null
          created_at?: string
          effectif_entreprise?: string | null
          email?: string | null
          forme_juridique?: string | null
          id?: string
          naf_code?: string | null
          nom: string
          notes?: string | null
          organization_id?: string | null
          parent_client_id?: string | null
          questionnaire_completed_at?: string | null
          questionnaire_token?: string | null
          region?: string | null
          siren?: string | null
          siret?: string | null
          telephone?: string | null
          tva_intracommunautaire?: string | null
          updated_at?: string
          ville?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean
          adresse?: string | null
          client_type?: string | null
          code_postal?: string | null
          contact_email?: string | null
          contact_nom?: string | null
          contact_prenom?: string | null
          contact_telephone?: string | null
          created_at?: string
          effectif_entreprise?: string | null
          email?: string | null
          forme_juridique?: string | null
          id?: string
          naf_code?: string | null
          nom?: string
          notes?: string | null
          organization_id?: string | null
          parent_client_id?: string | null
          questionnaire_completed_at?: string | null
          questionnaire_token?: string | null
          region?: string | null
          siren?: string | null
          siret?: string | null
          telephone?: string | null
          tva_intracommunautaire?: string | null
          updated_at?: string
          ville?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_parent_client_id_fkey"
            columns: ["parent_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_parent_client_id_fkey"
            columns: ["parent_client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
        ]
      }
      contact_replies: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          message: string
          replied_by: string | null
          replied_by_name: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          message: string
          replied_by?: string | null
          replied_by_name?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          message?: string
          replied_by?: string | null
          replied_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_replies_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone: string | null
          read: boolean | null
          replied: boolean | null
          replied_at: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone?: string | null
          read?: boolean | null
          replied?: boolean | null
          replied_at?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone?: string | null
          read?: boolean | null
          replied?: boolean | null
          replied_at?: string | null
          subject?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          budget: string | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          offer_id: string | null
          phone: string | null
          read_at: string | null
          replied_at: string | null
          service_id: string | null
          source: string | null
          status: string | null
          subject: string | null
          timeline: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          budget?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          offer_id?: string | null
          phone?: string | null
          read_at?: string | null
          replied_at?: string | null
          service_id?: string | null
          source?: string | null
          status?: string | null
          subject?: string | null
          timeline?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          budget?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          offer_id?: string | null
          phone?: string | null
          read_at?: string | null
          replied_at?: string | null
          service_id?: string | null
          source?: string | null
          status?: string | null
          subject?: string | null
          timeline?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_consents: {
        Row: {
          analytics: boolean
          consent_date: string
          consent_method: string
          created_at: string
          essential: boolean
          functional: boolean
          id: string
          ip_hash: string | null
          user_agent: string | null
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          analytics?: boolean
          consent_date?: string
          consent_method?: string
          created_at?: string
          essential?: boolean
          functional?: boolean
          id?: string
          ip_hash?: string | null
          user_agent?: string | null
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          analytics?: boolean
          consent_date?: string
          consent_method?: string
          created_at?: string
          essential?: boolean
          functional?: boolean
          id?: string
          ip_hash?: string | null
          user_agent?: string | null
          user_id?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      dev_request_columns: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          is_resolved: boolean | null
          is_system: boolean | null
          name: string
          position: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_resolved?: boolean | null
          is_system?: boolean | null
          name: string
          position?: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_resolved?: boolean | null
          is_system?: boolean | null
          name?: string
          position?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dev_request_comment_images: {
        Row: {
          comment_id: string
          created_at: string
          file_name: string | null
          id: string
          image_url: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          file_name?: string | null
          id?: string
          image_url: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          file_name?: string | null
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_request_comment_images_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "dev_request_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_request_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          request_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          request_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          request_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_request_comments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "dev_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_request_history: {
        Row: {
          action_type: Database["public"]["Enums"]["dev_request_action"]
          created_at: string
          id: string
          new_value: string | null
          old_value: string | null
          request_id: string
          user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["dev_request_action"]
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          request_id: string
          user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["dev_request_action"]
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          request_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dev_request_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "dev_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_request_images: {
        Row: {
          created_at: string
          file_name: string | null
          id: string
          image_url: string
          request_id: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          id?: string
          image_url: string
          request_id: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          id?: string
          image_url?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_request_images_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "dev_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_requests: {
        Row: {
          assigned_to: string[] | null
          column_order: number
          column_slug: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["dev_request_priority"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["dev_request_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string[] | null
          column_order?: number
          column_slug?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["dev_request_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dev_request_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string[] | null
          column_order?: number
          column_slug?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["dev_request_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dev_request_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      devis_requests: {
        Row: {
          civilite: string | null
          contact_nom: string
          contact_prenom: string
          created_at: string
          date_souhaitee: string | null
          email: string
          entreprise: string
          formation_id: string
          formation_title: string
          id: string
          message: string | null
          nombre_participants: number | null
          siret: string
          status: string
          telephone: string | null
          updated_at: string
        }
        Insert: {
          civilite?: string | null
          contact_nom: string
          contact_prenom: string
          created_at?: string
          date_souhaitee?: string | null
          email: string
          entreprise: string
          formation_id: string
          formation_title: string
          id?: string
          message?: string | null
          nombre_participants?: number | null
          siret: string
          status?: string
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          civilite?: string | null
          contact_nom?: string
          contact_prenom?: string
          created_at?: string
          date_souhaitee?: string | null
          email?: string
          entreprise?: string
          formation_id?: string
          formation_title?: string
          id?: string
          message?: string | null
          nombre_participants?: number | null
          siret?: string
          status?: string
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      document_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          metadata: Json | null
          recipient: string
          resend_id: string | null
          status: string | null
          subject: string | null
          template: string
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          metadata?: Json | null
          recipient: string
          resend_id?: string | null
          status?: string | null
          subject?: string | null
          template: string
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          metadata?: Json | null
          recipient?: string
          resend_id?: string | null
          status?: string | null
          subject?: string | null
          template?: string
        }
        Relationships: []
      }
      email_verification_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          redirect_to: string | null
          token: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          redirect_to?: string | null
          token: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          redirect_to?: string | null
          token?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      employee_invitations: {
        Row: {
          account_created: boolean | null
          account_created_at: string | null
          client_id: string
          created_at: string
          email: string
          email_sent: boolean | null
          email_sent_at: string | null
          error_message: string | null
          first_login_at: string | null
          id: string
          inscription_id: string | null
          invitation_token: string | null
          invited_at: string
          invited_by: string | null
          session_id: string
          status: string
          token_expires_at: string | null
          token_used_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_created?: boolean | null
          account_created_at?: string | null
          client_id: string
          created_at?: string
          email: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          error_message?: string | null
          first_login_at?: string | null
          id?: string
          inscription_id?: string | null
          invitation_token?: string | null
          invited_at?: string
          invited_by?: string | null
          session_id: string
          status?: string
          token_expires_at?: string | null
          token_used_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_created?: boolean | null
          account_created_at?: string | null
          client_id?: string
          created_at?: string
          email?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          error_message?: string | null
          first_login_at?: string | null
          id?: string
          inscription_id?: string | null
          invitation_token?: string | null
          invited_at?: string
          invited_by?: string | null
          session_id?: string
          status?: string
          token_expires_at?: string | null
          token_used_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_invitations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_invitations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "employee_invitations_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_invitations_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "session_participants_detail"
            referencedColumns: ["inscription_id"]
          },
          {
            foreignKeyName: "employee_invitations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_categories: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          active: boolean | null
          answer: string
          category_id: string
          created_at: string
          display_order: number | null
          helpful_count: number | null
          id: string
          keywords: string[] | null
          not_helpful_count: number | null
          question: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          active?: boolean | null
          answer: string
          category_id: string
          created_at?: string
          display_order?: number | null
          helpful_count?: number | null
          id?: string
          keywords?: string[] | null
          not_helpful_count?: number | null
          question: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          active?: boolean | null
          answer?: string
          category_id?: string
          created_at?: string
          display_order?: number | null
          helpful_count?: number | null
          id?: string
          keywords?: string[] | null
          not_helpful_count?: number | null
          question?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      feuilles_presence: {
        Row: {
          created_at: string | null
          date: string
          id: string
          inscription_id: string
          notes: string | null
          present: boolean | null
          session_id: string
          signature_apprenant: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          inscription_id: string
          notes?: string | null
          present?: boolean | null
          session_id: string
          signature_apprenant?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          inscription_id?: string
          notes?: string | null
          present?: boolean | null
          session_id?: string
          signature_apprenant?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feuilles_presence_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feuilles_presence_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "session_participants_detail"
            referencedColumns: ["inscription_id"]
          },
          {
            foreignKeyName: "feuilles_presence_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      formateur_disponibilites: {
        Row: {
          created_at: string | null
          date: string
          heure_debut: string | null
          heure_fin: string | null
          id: string
          notes: string | null
          periode: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          notes?: string | null
          periode?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          notes?: string | null
          periode?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      formateur_documents: {
        Row: {
          category_id: string | null
          file_path: string
          file_size: number | null
          file_type: string
          formateur_id: string
          id: string
          name: string
          uploaded_at: string | null
        }
        Insert: {
          category_id?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          formateur_id: string
          id?: string
          name: string
          uploaded_at?: string | null
        }
        Update: {
          category_id?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          formateur_id?: string
          id?: string
          name?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formateur_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formateur_documents_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formateur_documents_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "public_formateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      formateur_factures: {
        Row: {
          created_at: string | null
          date_emission: string | null
          date_paiement: string | null
          file_path: string | null
          id: string
          montant: number
          numero: string
          session_id: string
          statut: string | null
          tva: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_emission?: string | null
          date_paiement?: string | null
          file_path?: string | null
          id?: string
          montant: number
          numero: string
          session_id: string
          statut?: string | null
          tva?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_emission?: string | null
          date_paiement?: string | null
          file_path?: string | null
          id?: string
          montant?: number
          numero?: string
          session_id?: string
          statut?: string | null
          tva?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "formateur_factures_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      formateur_history: {
        Row: {
          change_type: string
          changed_at: string
          changed_by: string | null
          changed_fields: string[] | null
          formateur_id: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
        }
        Insert: {
          change_type: string
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          formateur_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
        }
        Update: {
          change_type?: string
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          formateur_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "formateur_history_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formateur_history_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "public_formateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      formateur_recurrences: {
        Row: {
          created_at: string
          date_debut: string | null
          date_fin: string | null
          heure_debut: string | null
          heure_fin: string | null
          id: string
          jour_semaine: number
          notes: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_debut?: string | null
          date_fin?: string | null
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          jour_semaine: number
          notes?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_debut?: string | null
          date_fin?: string | null
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          jour_semaine?: number
          notes?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      formateur_specialites: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      formateurs: {
        Row: {
          active: boolean
          adresse: string | null
          assujetti_tva: boolean | null
          bio: string | null
          civilite: string | null
          code_postal: string | null
          created_at: string
          email: string | null
          id: string
          nom: string
          numero_nda: string | null
          numero_tva: string | null
          prenom: string
          siret: string | null
          specialites: string[] | null
          tarif_demi_journee: number | null
          tarif_journalier: number | null
          telephone: string | null
          updated_at: string
          user_id: string
          ville: string | null
        }
        Insert: {
          active?: boolean
          adresse?: string | null
          assujetti_tva?: boolean | null
          bio?: string | null
          civilite?: string | null
          code_postal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom: string
          numero_nda?: string | null
          numero_tva?: string | null
          prenom: string
          siret?: string | null
          specialites?: string[] | null
          tarif_demi_journee?: number | null
          tarif_journalier?: number | null
          telephone?: string | null
          updated_at?: string
          user_id: string
          ville?: string | null
        }
        Update: {
          active?: boolean
          adresse?: string | null
          assujetti_tva?: boolean | null
          bio?: string | null
          civilite?: string | null
          code_postal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          numero_nda?: string | null
          numero_tva?: string | null
          prenom?: string
          siret?: string | null
          specialites?: string[] | null
          tarif_demi_journee?: number | null
          tarif_journalier?: number | null
          telephone?: string | null
          updated_at?: string
          user_id?: string
          ville?: string | null
        }
        Relationships: []
      }
      formation_formateurs: {
        Row: {
          certifie: boolean | null
          created_at: string | null
          derniere_intervention: string | null
          formateur_id: string
          formation_id: string
          id: string
          niveau_competence: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          certifie?: boolean | null
          created_at?: string | null
          derniere_intervention?: string | null
          formateur_id: string
          formation_id: string
          id?: string
          niveau_competence?: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          certifie?: boolean | null
          created_at?: string | null
          derniere_intervention?: string | null
          formateur_id?: string
          formation_id?: string
          id?: string
          niveau_competence?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formation_formateurs_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formation_formateurs_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "public_formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formation_formateurs_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
        ]
      }
      formation_requests: {
        Row: {
          adresse: string | null
          civilite: string | null
          code_postal: string | null
          created_at: string | null
          dates_souhaitees: string | null
          demandeur_est_participant: boolean | null
          email: string
          end_date: string | null
          entreprise: string | null
          formation_id: string
          formation_title: string
          id: string
          message: string | null
          needs_analysis_id: string | null
          nom: string
          nombre_participants: number | null
          notes_admin: string | null
          prenom: string
          session_id: string | null
          siret: string | null
          start_date: string | null
          status: string | null
          telephone: string | null
          traite_par: string | null
          type_demandeur: string
          updated_at: string | null
          urgence: string
          user_id: string | null
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          civilite?: string | null
          code_postal?: string | null
          created_at?: string | null
          dates_souhaitees?: string | null
          demandeur_est_participant?: boolean | null
          email: string
          end_date?: string | null
          entreprise?: string | null
          formation_id: string
          formation_title: string
          id?: string
          message?: string | null
          needs_analysis_id?: string | null
          nom: string
          nombre_participants?: number | null
          notes_admin?: string | null
          prenom: string
          session_id?: string | null
          siret?: string | null
          start_date?: string | null
          status?: string | null
          telephone?: string | null
          traite_par?: string | null
          type_demandeur: string
          updated_at?: string | null
          urgence: string
          user_id?: string | null
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          civilite?: string | null
          code_postal?: string | null
          created_at?: string | null
          dates_souhaitees?: string | null
          demandeur_est_participant?: boolean | null
          email?: string
          end_date?: string | null
          entreprise?: string | null
          formation_id?: string
          formation_title?: string
          id?: string
          message?: string | null
          needs_analysis_id?: string | null
          nom?: string
          nombre_participants?: number | null
          notes_admin?: string | null
          prenom?: string
          session_id?: string | null
          siret?: string | null
          start_date?: string | null
          status?: string | null
          telephone?: string | null
          traite_par?: string | null
          type_demandeur?: string
          updated_at?: string | null
          urgence?: string
          user_id?: string | null
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formation_requests_needs_analysis_id_fkey"
            columns: ["needs_analysis_id"]
            isOneToOne: false
            referencedRelation: "needs_analysis_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formation_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          accessibilite: string | null
          active: boolean | null
          bibliographie: Json | null
          category_id: string | null
          certification: string | null
          competences_visees: Json | null
          created_at: string
          custom_fields: Json | null
          delai_acces: string | null
          description: string | null
          duration: string
          encadrement_pedagogique: string | null
          financement: Json | null
          format_lieu: string | null
          id: string
          image_url: string | null
          indexed_content: string | null
          indicateurs_reussite: Json | null
          lien_objectifs_evaluation: string | null
          manual_validations: Json | null
          meta_description: string | null
          meta_title: string | null
          modalites: Json | null
          modalites_paiement: string | null
          nombre_participants: string | null
          objectifs_generaux: Json | null
          objectifs_operationnels: Json | null
          organization_id: string | null
          pole: string
          pole_name: string
          popular: boolean | null
          prerequis: Json | null
          price: string
          price_inter_unit: string | null
          price_inter_value: number | null
          price_intra_unit: string | null
          price_intra_value: number | null
          price_unit: string | null
          price_value: number | null
          prochaine_sessions: Json | null
          programme: Json | null
          public_vise: Json | null
          resultats_attendus: Json | null
          show_logo_savoir_enfance: boolean | null
          show_logo_securgies: boolean | null
          slug: string
          subtitle: string | null
          tags: string[] | null
          title: string
          tracabilite: Json | null
          updated_at: string
        }
        Insert: {
          accessibilite?: string | null
          active?: boolean | null
          bibliographie?: Json | null
          category_id?: string | null
          certification?: string | null
          competences_visees?: Json | null
          created_at?: string
          custom_fields?: Json | null
          delai_acces?: string | null
          description?: string | null
          duration: string
          encadrement_pedagogique?: string | null
          financement?: Json | null
          format_lieu?: string | null
          id: string
          image_url?: string | null
          indexed_content?: string | null
          indicateurs_reussite?: Json | null
          lien_objectifs_evaluation?: string | null
          manual_validations?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          modalites?: Json | null
          modalites_paiement?: string | null
          nombre_participants?: string | null
          objectifs_generaux?: Json | null
          objectifs_operationnels?: Json | null
          organization_id?: string | null
          pole: string
          pole_name: string
          popular?: boolean | null
          prerequis?: Json | null
          price: string
          price_inter_unit?: string | null
          price_inter_value?: number | null
          price_intra_unit?: string | null
          price_intra_value?: number | null
          price_unit?: string | null
          price_value?: number | null
          prochaine_sessions?: Json | null
          programme?: Json | null
          public_vise?: Json | null
          resultats_attendus?: Json | null
          show_logo_savoir_enfance?: boolean | null
          show_logo_securgies?: boolean | null
          slug: string
          subtitle?: string | null
          tags?: string[] | null
          title: string
          tracabilite?: Json | null
          updated_at?: string
        }
        Update: {
          accessibilite?: string | null
          active?: boolean | null
          bibliographie?: Json | null
          category_id?: string | null
          certification?: string | null
          competences_visees?: Json | null
          created_at?: string
          custom_fields?: Json | null
          delai_acces?: string | null
          description?: string | null
          duration?: string
          encadrement_pedagogique?: string | null
          financement?: Json | null
          format_lieu?: string | null
          id?: string
          image_url?: string | null
          indexed_content?: string | null
          indicateurs_reussite?: Json | null
          lien_objectifs_evaluation?: string | null
          manual_validations?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          modalites?: Json | null
          modalites_paiement?: string | null
          nombre_participants?: string | null
          objectifs_generaux?: Json | null
          objectifs_operationnels?: Json | null
          organization_id?: string | null
          pole?: string
          pole_name?: string
          popular?: boolean | null
          prerequis?: Json | null
          price?: string
          price_inter_unit?: string | null
          price_inter_value?: number | null
          price_intra_unit?: string | null
          price_intra_value?: number | null
          price_unit?: string | null
          price_value?: number | null
          prochaine_sessions?: Json | null
          programme?: Json | null
          public_vise?: Json | null
          resultats_attendus?: Json | null
          show_logo_savoir_enfance?: boolean | null
          show_logo_securgies?: boolean | null
          slug?: string
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          tracabilite?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      french_regions: {
        Row: {
          code: string
          name: string
          zone: string | null
        }
        Insert: {
          code: string
          name: string
          zone?: string | null
        }
        Update: {
          code?: string
          name?: string
          zone?: string | null
        }
        Relationships: []
      }
      inscription_opco_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          inscription_id: string
          name: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_path: string
          file_size?: number | null
          id?: string
          inscription_id: string
          name: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          inscription_id?: string
          name?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscription_opco_documents_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_opco_documents_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "session_participants_detail"
            referencedColumns: ["inscription_id"]
          },
          {
            foreignKeyName: "inscription_opco_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inscriptions: {
        Row: {
          added_by_client: boolean | null
          admin_seen_at: string | null
          adresse: string | null
          civilite: string | null
          client_id: string | null
          contact_privilegie: string | null
          created_at: string
          date_naissance: string | null
          document_prise_en_charge_path: string | null
          email: string
          email_personnel: string | null
          entreprise: string | null
          financement: string | null
          formation_request_id: string | null
          id: string
          image_rights_consent: boolean | null
          needs_analysis_completed_at: string | null
          needs_analysis_response_id: string | null
          needs_analysis_sent_at: string | null
          needs_analysis_template_id: string | null
          needs_analysis_token: string | null
          nom: string
          notes: string | null
          numero_prise_en_charge: string | null
          opco_date_demande: string | null
          opco_date_reponse: string | null
          opco_montant_prise_charge: number | null
          opco_nom: string | null
          opco_notes: string | null
          opco_numero_prise_charge: string | null
          opco_statut: string | null
          poste: string | null
          prenom: string
          responsable_email: string | null
          responsable_nom: string | null
          responsable_prenom: string | null
          responsable_telephone: string | null
          session_id: string
          siret: string | null
          status: string | null
          telephone: string | null
          tracking_code: string | null
          type_inscription: string | null
          updated_at: string
          user_id: string | null
          validation_date: string | null
          validation_justification: string | null
          validation_par: string | null
          validation_statut: string | null
        }
        Insert: {
          added_by_client?: boolean | null
          admin_seen_at?: string | null
          adresse?: string | null
          civilite?: string | null
          client_id?: string | null
          contact_privilegie?: string | null
          created_at?: string
          date_naissance?: string | null
          document_prise_en_charge_path?: string | null
          email: string
          email_personnel?: string | null
          entreprise?: string | null
          financement?: string | null
          formation_request_id?: string | null
          id?: string
          image_rights_consent?: boolean | null
          needs_analysis_completed_at?: string | null
          needs_analysis_response_id?: string | null
          needs_analysis_sent_at?: string | null
          needs_analysis_template_id?: string | null
          needs_analysis_token?: string | null
          nom: string
          notes?: string | null
          numero_prise_en_charge?: string | null
          opco_date_demande?: string | null
          opco_date_reponse?: string | null
          opco_montant_prise_charge?: number | null
          opco_nom?: string | null
          opco_notes?: string | null
          opco_numero_prise_charge?: string | null
          opco_statut?: string | null
          poste?: string | null
          prenom: string
          responsable_email?: string | null
          responsable_nom?: string | null
          responsable_prenom?: string | null
          responsable_telephone?: string | null
          session_id: string
          siret?: string | null
          status?: string | null
          telephone?: string | null
          tracking_code?: string | null
          type_inscription?: string | null
          updated_at?: string
          user_id?: string | null
          validation_date?: string | null
          validation_justification?: string | null
          validation_par?: string | null
          validation_statut?: string | null
        }
        Update: {
          added_by_client?: boolean | null
          admin_seen_at?: string | null
          adresse?: string | null
          civilite?: string | null
          client_id?: string | null
          contact_privilegie?: string | null
          created_at?: string
          date_naissance?: string | null
          document_prise_en_charge_path?: string | null
          email?: string
          email_personnel?: string | null
          entreprise?: string | null
          financement?: string | null
          formation_request_id?: string | null
          id?: string
          image_rights_consent?: boolean | null
          needs_analysis_completed_at?: string | null
          needs_analysis_response_id?: string | null
          needs_analysis_sent_at?: string | null
          needs_analysis_template_id?: string | null
          needs_analysis_token?: string | null
          nom?: string
          notes?: string | null
          numero_prise_en_charge?: string | null
          opco_date_demande?: string | null
          opco_date_reponse?: string | null
          opco_montant_prise_charge?: number | null
          opco_nom?: string | null
          opco_notes?: string | null
          opco_numero_prise_charge?: string | null
          opco_statut?: string | null
          poste?: string | null
          prenom?: string
          responsable_email?: string | null
          responsable_nom?: string | null
          responsable_prenom?: string | null
          responsable_telephone?: string | null
          session_id?: string
          siret?: string | null
          status?: string | null
          telephone?: string | null
          tracking_code?: string | null
          type_inscription?: string | null
          updated_at?: string
          user_id?: string | null
          validation_date?: string | null
          validation_justification?: string | null
          validation_par?: string | null
          validation_statut?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "inscriptions_formation_request_id_fkey"
            columns: ["formation_request_id"]
            isOneToOne: false
            referencedRelation: "formation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_needs_analysis_response_id_fkey"
            columns: ["needs_analysis_response_id"]
            isOneToOne: false
            referencedRelation: "needs_analysis_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_needs_analysis_template_id_fkey"
            columns: ["needs_analysis_template_id"]
            isOneToOne: false
            referencedRelation: "needs_analysis_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_validation_par_fkey"
            columns: ["validation_par"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          name: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          name: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          name?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      needs_analysis: {
        Row: {
          attentes_particulieres: string | null
          autre_raison: string | null
          client_id: string | null
          completed_at: string | null
          completed_by: string | null
          compliance_reglementaire: boolean | null
          contraintes_horaires: string | null
          created_at: string | null
          demande_salarie: boolean | null
          developpement_competences: boolean | null
          id: string
          lieu_prefere: string | null
          montee_en_competences: boolean | null
          niveau_actuel: string | null
          nombre_participants_estime: number | null
          objectifs_specifiques: string | null
          obligation_employeur: boolean | null
          reconversion_professionnelle: boolean | null
          renouvellement_certification: boolean | null
          session_id: string
          updated_at: string | null
        }
        Insert: {
          attentes_particulieres?: string | null
          autre_raison?: string | null
          client_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          compliance_reglementaire?: boolean | null
          contraintes_horaires?: string | null
          created_at?: string | null
          demande_salarie?: boolean | null
          developpement_competences?: boolean | null
          id?: string
          lieu_prefere?: string | null
          montee_en_competences?: boolean | null
          niveau_actuel?: string | null
          nombre_participants_estime?: number | null
          objectifs_specifiques?: string | null
          obligation_employeur?: boolean | null
          reconversion_professionnelle?: boolean | null
          renouvellement_certification?: boolean | null
          session_id: string
          updated_at?: string | null
        }
        Update: {
          attentes_particulieres?: string | null
          autre_raison?: string | null
          client_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          compliance_reglementaire?: boolean | null
          contraintes_horaires?: string | null
          created_at?: string | null
          demande_salarie?: boolean | null
          developpement_competences?: boolean | null
          id?: string
          lieu_prefere?: string | null
          montee_en_competences?: boolean | null
          niveau_actuel?: string | null
          nombre_participants_estime?: number | null
          objectifs_specifiques?: string | null
          obligation_employeur?: boolean | null
          reconversion_professionnelle?: boolean | null
          renouvellement_certification?: boolean | null
          session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "needs_analysis_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_analysis_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "needs_analysis_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      needs_analysis_responses: {
        Row: {
          analysis_notes: string | null
          analyzed_at: string | null
          analyzed_by: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string | null
          formation_request_id: string | null
          id: string
          inscription_id: string | null
          respondent_email: string | null
          respondent_name: string | null
          respondent_role: string | null
          responses: Json
          session_id: string | null
          submitted_at: string | null
          template_id: string
        }
        Insert: {
          analysis_notes?: string | null
          analyzed_at?: string | null
          analyzed_by?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          formation_request_id?: string | null
          id?: string
          inscription_id?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_role?: string | null
          responses?: Json
          session_id?: string | null
          submitted_at?: string | null
          template_id: string
        }
        Update: {
          analysis_notes?: string | null
          analyzed_at?: string | null
          analyzed_by?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          formation_request_id?: string | null
          id?: string
          inscription_id?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_role?: string | null
          responses?: Json
          session_id?: string | null
          submitted_at?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "needs_analysis_responses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_analysis_responses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "needs_analysis_responses_formation_request_id_fkey"
            columns: ["formation_request_id"]
            isOneToOne: false
            referencedRelation: "formation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_analysis_responses_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_analysis_responses_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "session_participants_detail"
            referencedColumns: ["inscription_id"]
          },
          {
            foreignKeyName: "needs_analysis_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_analysis_responses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "needs_analysis_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      needs_analysis_templates: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          formation_id: string | null
          id: string
          is_default: boolean | null
          name: string
          questions: Json
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          formation_id?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          questions?: Json
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          formation_id?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          questions?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "needs_analysis_templates_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          active: boolean | null
          category: string
          created_at: string | null
          description: string | null
          features: Json | null
          highlighted: boolean | null
          id: string
          name: string
          popular: boolean | null
          price_hourly: number | null
          price_monthly: number | null
          price_setup: number | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          highlighted?: boolean | null
          id?: string
          name: string
          popular?: boolean | null
          price_hourly?: number | null
          price_monthly?: number | null
          price_setup?: number | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          highlighted?: boolean | null
          id?: string
          name?: string
          popular?: boolean | null
          price_hourly?: number | null
          price_monthly?: number | null
          price_setup?: number | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          client_id: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: string | null
          token: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_id?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          role?: string | null
          token: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: string | null
          token?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
        ]
      }
      organizations: {
        Row: {
          active: boolean | null
          contact_email: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      poles: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          icon: string
          id: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          adresse: string | null
          assujetti_tva: boolean | null
          avatar_url: string | null
          bio: string | null
          civilite: string | null
          code_postal: string | null
          created_at: string
          entreprise: string | null
          first_name: string | null
          id: string
          image_rights_consent: boolean | null
          image_rights_consent_date: string | null
          image_rights_consent_ip: string | null
          last_name: string | null
          needs_password_setup: boolean | null
          numero_nda: string | null
          numero_tva: string | null
          poste: string | null
          profile_complete: boolean | null
          siret: string | null
          specialites: string[] | null
          tarif_demi_journee: number | null
          tarif_journalier: number | null
          telephone: string | null
          updated_at: string
          ville: string | null
        }
        Insert: {
          account_type?: string | null
          adresse?: string | null
          assujetti_tva?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          civilite?: string | null
          code_postal?: string | null
          created_at?: string
          entreprise?: string | null
          first_name?: string | null
          id: string
          image_rights_consent?: boolean | null
          image_rights_consent_date?: string | null
          image_rights_consent_ip?: string | null
          last_name?: string | null
          needs_password_setup?: boolean | null
          numero_nda?: string | null
          numero_tva?: string | null
          poste?: string | null
          profile_complete?: boolean | null
          siret?: string | null
          specialites?: string[] | null
          tarif_demi_journee?: number | null
          tarif_journalier?: number | null
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Update: {
          account_type?: string | null
          adresse?: string | null
          assujetti_tva?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          civilite?: string | null
          code_postal?: string | null
          created_at?: string
          entreprise?: string | null
          first_name?: string | null
          id?: string
          image_rights_consent?: boolean | null
          image_rights_consent_date?: string | null
          image_rights_consent_ip?: string | null
          last_name?: string | null
          needs_password_setup?: boolean | null
          numero_nda?: string | null
          numero_tva?: string | null
          poste?: string | null
          profile_complete?: boolean | null
          siret?: string | null
          specialites?: string[] | null
          tarif_demi_journee?: number | null
          tarif_journalier?: number | null
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string | null
          client_name: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          gallery: Json | null
          id: string
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          published: boolean | null
          slug: string
          sort_order: number | null
          technologies: string[] | null
          testimonial: string | null
          testimonial_author: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          category?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          gallery?: Json | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          slug: string
          sort_order?: number | null
          technologies?: string[] | null
          testimonial?: string | null
          testimonial_author?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          category?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          gallery?: Json | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          slug?: string
          sort_order?: number | null
          technologies?: string[] | null
          testimonial?: string | null
          testimonial_author?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          notify_contacts: boolean | null
          notify_dev_requests: boolean | null
          notify_documents: boolean | null
          notify_inscriptions: boolean | null
          notify_messages: boolean | null
          notify_needs_analysis: boolean | null
          notify_sessions: boolean | null
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          notify_contacts?: boolean | null
          notify_dev_requests?: boolean | null
          notify_documents?: boolean | null
          notify_inscriptions?: boolean | null
          notify_messages?: boolean | null
          notify_needs_analysis?: boolean | null
          notify_sessions?: boolean | null
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          notify_contacts?: boolean | null
          notify_dev_requests?: boolean | null
          notify_documents?: boolean | null
          notify_inscriptions?: boolean | null
          notify_messages?: boolean | null
          notify_needs_analysis?: boolean | null
          notify_sessions?: boolean | null
          p256dh?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          count: number | null
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          action_type: string
          count?: number | null
          created_at?: string
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          action_type?: string
          count?: number | null
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string
          hit_count: number
          id: string
          is_active: boolean
          last_hit_at: string | null
          notes: string | null
          source_path: string
          status_code: number
          target_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hit_count?: number
          id?: string
          is_active?: boolean
          last_hit_at?: string | null
          notes?: string | null
          source_path: string
          status_code?: number
          target_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hit_count?: number
          id?: string
          is_active?: boolean
          last_hit_at?: string | null
          notes?: string | null
          source_path?: string
          status_code?: number
          target_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      satisfaction_surveys: {
        Row: {
          created_at: string | null
          formation_id: string
          id: string
          inscription_id: string
          note_applicabilite: number
          note_contenu: number
          note_formateur: number
          note_globale: number | null
          note_objectifs: number
          note_organisation: number
          note_supports: number
          points_amelioration: string | null
          points_forts: string | null
          recommandation: boolean
          reviewer_type: string
          session_id: string
          temoignage: string | null
          temoignage_approuve: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          formation_id: string
          id?: string
          inscription_id: string
          note_applicabilite: number
          note_contenu: number
          note_formateur: number
          note_globale?: number | null
          note_objectifs: number
          note_organisation: number
          note_supports: number
          points_amelioration?: string | null
          points_forts?: string | null
          recommandation?: boolean
          reviewer_type: string
          session_id: string
          temoignage?: string | null
          temoignage_approuve?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          formation_id?: string
          id?: string
          inscription_id?: string
          note_applicabilite?: number
          note_contenu?: number
          note_formateur?: number
          note_globale?: number | null
          note_objectifs?: number
          note_organisation?: number
          note_supports?: number
          points_amelioration?: string | null
          points_forts?: string | null
          recommandation?: boolean
          reviewer_type?: string
          session_id?: string
          temoignage?: string | null
          temoignage_approuve?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          features: Json | null
          icon: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      session_clients: {
        Row: {
          client_id: string
          contact_email: string | null
          contact_nom: string | null
          contact_telephone: string | null
          created_at: string | null
          id: string
          is_financeur: boolean | null
          notes: string | null
          role: string | null
          session_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          contact_email?: string | null
          contact_nom?: string | null
          contact_telephone?: string | null
          created_at?: string | null
          id?: string
          is_financeur?: boolean | null
          notes?: string | null
          role?: string | null
          session_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          contact_email?: string | null
          contact_nom?: string | null
          contact_telephone?: string | null
          created_at?: string | null
          id?: string
          is_financeur?: boolean | null
          notes?: string | null
          role?: string | null
          session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "session_clients_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_contacts: {
        Row: {
          created_at: string | null
          email: string
          fonction: string
          id: string
          is_primary: boolean | null
          nom: string
          prenom: string
          session_id: string
          telephone: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          fonction?: string
          id?: string
          is_primary?: boolean | null
          nom: string
          prenom: string
          session_id: string
          telephone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          fonction?: string
          id?: string
          is_primary?: boolean | null
          nom?: string
          prenom?: string
          session_id?: string
          telephone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_contacts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_conversations: {
        Row: {
          created_at: string | null
          id: string
          participant_id: string | null
          session_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          participant_id?: string | null
          session_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          participant_id?: string | null
          session_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_documents: {
        Row: {
          created_at: string
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          name: string
          participant_id: string | null
          session_id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_path: string
          file_size?: number | null
          id?: string
          name: string
          participant_id?: string | null
          session_id: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          name?: string
          participant_id?: string | null
          session_id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_documents_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_documents_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "session_participants_detail"
            referencedColumns: ["inscription_id"]
          },
          {
            foreignKeyName: "session_documents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_formateurs: {
        Row: {
          confirmed: boolean | null
          confirmed_at: string | null
          created_at: string | null
          created_by: string | null
          formateur_id: string
          groupe_participants: string | null
          id: string
          notes: string | null
          role: string
          session_id: string
          updated_at: string | null
        }
        Insert: {
          confirmed?: boolean | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          formateur_id: string
          groupe_participants?: string | null
          id?: string
          notes?: string | null
          role?: string
          session_id: string
          updated_at?: string | null
        }
        Update: {
          confirmed?: boolean | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          formateur_id?: string
          groupe_participants?: string | null
          id?: string
          notes?: string | null
          role?: string
          session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_formateurs_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_formateurs_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "public_formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_formateurs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_history: {
        Row: {
          action_type: Database["public"]["Enums"]["session_action"]
          created_at: string | null
          id: string
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["session_action"]
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["session_action"]
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_horaires_presets: {
        Row: {
          created_at: string | null
          horaires_apres_midi_debut: string | null
          horaires_apres_midi_fin: string | null
          horaires_matin_debut: string | null
          horaires_matin_fin: string | null
          id: string
          is_default: boolean | null
          label: string
        }
        Insert: {
          created_at?: string | null
          horaires_apres_midi_debut?: string | null
          horaires_apres_midi_fin?: string | null
          horaires_matin_debut?: string | null
          horaires_matin_fin?: string | null
          id?: string
          is_default?: boolean | null
          label: string
        }
        Update: {
          created_at?: string | null
          horaires_apres_midi_debut?: string | null
          horaires_apres_midi_fin?: string | null
          horaires_matin_debut?: string | null
          horaires_matin_fin?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
        }
        Relationships: []
      }
      session_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          edited_at: string | null
          id: string
          read_at: string | null
          sender_id: string | null
          sender_name: string | null
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          edited_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          edited_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "session_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          adresse: string | null
          client_adresse: string | null
          client_code_postal: string | null
          client_id: string | null
          client_siren: string | null
          client_siret: string | null
          client_ville: string | null
          code_postal: string | null
          created_at: string
          employee_management_token: string | null
          end_date: string | null
          format_type: string | null
          formateur: string | null
          formateur_externe_email: string | null
          formateur_externe_telephone: string | null
          formateur_id: string | null
          formateur_status: string | null
          formateur_user_id: string | null
          formation_id: string
          horaires: string | null
          horaires_apres_midi: string | null
          horaires_apres_midi_debut: string | null
          horaires_apres_midi_fin: string | null
          horaires_matin: string | null
          horaires_matin_debut: string | null
          horaires_matin_fin: string | null
          horaires_par_jour: Json | null
          id: string
          is_public: boolean | null
          latitude: number | null
          lien_visio: string | null
          lieu: string
          longitude: number | null
          needs_analysis_completed: boolean | null
          needs_analysis_data: Json | null
          notes: string | null
          organization_id: string | null
          places_disponibles: number | null
          places_max: number | null
          places_soft_limit: boolean | null
          start_date: string
          status: string | null
          updated_at: string
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          client_adresse?: string | null
          client_code_postal?: string | null
          client_id?: string | null
          client_siren?: string | null
          client_siret?: string | null
          client_ville?: string | null
          code_postal?: string | null
          created_at?: string
          employee_management_token?: string | null
          end_date?: string | null
          format_type?: string | null
          formateur?: string | null
          formateur_externe_email?: string | null
          formateur_externe_telephone?: string | null
          formateur_id?: string | null
          formateur_status?: string | null
          formateur_user_id?: string | null
          formation_id: string
          horaires?: string | null
          horaires_apres_midi?: string | null
          horaires_apres_midi_debut?: string | null
          horaires_apres_midi_fin?: string | null
          horaires_matin?: string | null
          horaires_matin_debut?: string | null
          horaires_matin_fin?: string | null
          horaires_par_jour?: Json | null
          id?: string
          is_public?: boolean | null
          latitude?: number | null
          lien_visio?: string | null
          lieu: string
          longitude?: number | null
          needs_analysis_completed?: boolean | null
          needs_analysis_data?: Json | null
          notes?: string | null
          organization_id?: string | null
          places_disponibles?: number | null
          places_max?: number | null
          places_soft_limit?: boolean | null
          start_date: string
          status?: string | null
          updated_at?: string
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          client_adresse?: string | null
          client_code_postal?: string | null
          client_id?: string | null
          client_siren?: string | null
          client_siret?: string | null
          client_ville?: string | null
          code_postal?: string | null
          created_at?: string
          employee_management_token?: string | null
          end_date?: string | null
          format_type?: string | null
          formateur?: string | null
          formateur_externe_email?: string | null
          formateur_externe_telephone?: string | null
          formateur_id?: string | null
          formateur_status?: string | null
          formateur_user_id?: string | null
          formation_id?: string
          horaires?: string | null
          horaires_apres_midi?: string | null
          horaires_apres_midi_debut?: string | null
          horaires_apres_midi_fin?: string | null
          horaires_matin?: string | null
          horaires_matin_debut?: string | null
          horaires_matin_fin?: string | null
          horaires_par_jour?: Json | null
          id?: string
          is_public?: boolean | null
          latitude?: number | null
          lien_visio?: string | null
          lieu?: string
          longitude?: number | null
          needs_analysis_completed?: boolean | null
          needs_analysis_data?: Json | null
          notes?: string | null
          organization_id?: string | null
          places_disponibles?: number | null
          places_max?: number | null
          places_soft_limit?: boolean | null
          start_date?: string
          status?: string | null
          updated_at?: string
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "public_formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_clients: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_primary: boolean
          role: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          role?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
        ]
      }
      user_history: {
        Row: {
          action_type: string
          changed_by: string | null
          created_at: string | null
          field_name: string | null
          id: string
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          changed_by?: string | null
          created_at?: string | null
          field_name?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          changed_by?: string | null
          created_at?: string | null
          field_name?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          created_at: string | null
          email_contact_confirmation: boolean | null
          email_contact_reply: boolean | null
          email_contacts: boolean | null
          email_dev_assignment: boolean | null
          email_dev_comment: boolean | null
          email_dev_requests: boolean | null
          email_dev_status: boolean | null
          email_formateur_assignment: boolean | null
          email_formateur_new_inscription: boolean | null
          email_inscription_cancellation: boolean | null
          email_inscription_confirmation: boolean | null
          email_inscription_status: boolean | null
          email_inscriptions: boolean | null
          email_messages: boolean | null
          email_session_cancelled: boolean | null
          email_session_reminder: boolean | null
          email_session_update: boolean | null
          email_sessions: boolean | null
          id: string
          inapp_contact_confirmation: boolean | null
          inapp_contact_reply: boolean | null
          inapp_contacts: boolean | null
          inapp_dev_assignment: boolean | null
          inapp_dev_comment: boolean | null
          inapp_dev_requests: boolean | null
          inapp_dev_status: boolean | null
          inapp_formateur_assignment: boolean | null
          inapp_formateur_new_inscription: boolean | null
          inapp_inscription_cancellation: boolean | null
          inapp_inscription_confirmation: boolean | null
          inapp_inscription_status: boolean | null
          inapp_inscriptions: boolean | null
          inapp_messages: boolean | null
          inapp_session_cancelled: boolean | null
          inapp_session_reminder: boolean | null
          inapp_session_update: boolean | null
          inapp_sessions: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_contact_confirmation?: boolean | null
          email_contact_reply?: boolean | null
          email_contacts?: boolean | null
          email_dev_assignment?: boolean | null
          email_dev_comment?: boolean | null
          email_dev_requests?: boolean | null
          email_dev_status?: boolean | null
          email_formateur_assignment?: boolean | null
          email_formateur_new_inscription?: boolean | null
          email_inscription_cancellation?: boolean | null
          email_inscription_confirmation?: boolean | null
          email_inscription_status?: boolean | null
          email_inscriptions?: boolean | null
          email_messages?: boolean | null
          email_session_cancelled?: boolean | null
          email_session_reminder?: boolean | null
          email_session_update?: boolean | null
          email_sessions?: boolean | null
          id?: string
          inapp_contact_confirmation?: boolean | null
          inapp_contact_reply?: boolean | null
          inapp_contacts?: boolean | null
          inapp_dev_assignment?: boolean | null
          inapp_dev_comment?: boolean | null
          inapp_dev_requests?: boolean | null
          inapp_dev_status?: boolean | null
          inapp_formateur_assignment?: boolean | null
          inapp_formateur_new_inscription?: boolean | null
          inapp_inscription_cancellation?: boolean | null
          inapp_inscription_confirmation?: boolean | null
          inapp_inscription_status?: boolean | null
          inapp_inscriptions?: boolean | null
          inapp_messages?: boolean | null
          inapp_session_cancelled?: boolean | null
          inapp_session_reminder?: boolean | null
          inapp_session_update?: boolean | null
          inapp_sessions?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_contact_confirmation?: boolean | null
          email_contact_reply?: boolean | null
          email_contacts?: boolean | null
          email_dev_assignment?: boolean | null
          email_dev_comment?: boolean | null
          email_dev_requests?: boolean | null
          email_dev_status?: boolean | null
          email_formateur_assignment?: boolean | null
          email_formateur_new_inscription?: boolean | null
          email_inscription_cancellation?: boolean | null
          email_inscription_confirmation?: boolean | null
          email_inscription_status?: boolean | null
          email_inscriptions?: boolean | null
          email_messages?: boolean | null
          email_session_cancelled?: boolean | null
          email_session_reminder?: boolean | null
          email_session_update?: boolean | null
          email_sessions?: boolean | null
          id?: string
          inapp_contact_confirmation?: boolean | null
          inapp_contact_reply?: boolean | null
          inapp_contacts?: boolean | null
          inapp_dev_assignment?: boolean | null
          inapp_dev_comment?: boolean | null
          inapp_dev_requests?: boolean | null
          inapp_dev_status?: boolean | null
          inapp_formateur_assignment?: boolean | null
          inapp_formateur_new_inscription?: boolean | null
          inapp_inscription_cancellation?: boolean | null
          inapp_inscription_confirmation?: boolean | null
          inapp_inscription_status?: boolean | null
          inapp_inscriptions?: boolean | null
          inapp_messages?: boolean | null
          inapp_session_cancelled?: boolean | null
          inapp_session_reminder?: boolean | null
          inapp_session_update?: boolean | null
          inapp_sessions?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_organizations: {
        Row: {
          added_by: string | null
          created_at: string
          departed_at: string | null
          departure_reason: string | null
          id: string
          is_primary: boolean
          organization_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          departed_at?: string | null
          departure_reason?: string | null
          id?: string
          is_primary?: boolean
          organization_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          departed_at?: string | null
          departure_reason?: string | null
          id?: string
          is_primary?: boolean
          organization_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      client_department_hierarchy: {
        Row: {
          active: boolean | null
          client_id: string | null
          client_nom: string | null
          client_type: string | null
          code: string | null
          depth: number | null
          hierarchy_name: string | null
          id: string | null
          manager_name: string | null
          manager_user_id: string | null
          name: string | null
          parent_department_id: string | null
          path: string[] | null
          sort_order: number | null
        }
        Relationships: []
      }
      client_hierarchy: {
        Row: {
          client_type: string | null
          depth: number | null
          hierarchy_name: string | null
          id: string | null
          nom: string | null
          parent_client_id: string | null
          path: string[] | null
          root_client_id: string | null
          siret: string | null
        }
        Relationships: []
      }
      client_users_with_profiles: {
        Row: {
          avatar_url: string | null
          client_id: string | null
          client_nom: string | null
          client_role: string | null
          client_siret: string | null
          client_type: string | null
          client_ville: string | null
          created_at: string | null
          departed_at: string | null
          department: string | null
          department_code: string | null
          department_id: string | null
          department_name: string | null
          departure_reason: string | null
          first_name: string | null
          id: string | null
          invited_at: string | null
          invited_by: string | null
          is_primary: boolean | null
          last_name: string | null
          managed_agency_ids: string[] | null
          parent_client_id: string | null
          role: string | null
          scope_all_agencies: boolean | null
          updated_at: string | null
          user_id: string | null
          user_telephone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "client_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "clients_parent_client_id_fkey"
            columns: ["parent_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_parent_client_id_fkey"
            columns: ["parent_client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
        ]
      }
      client_users_with_scope: {
        Row: {
          client_id: string | null
          client_nom: string | null
          client_role: string | null
          client_type: string | null
          department: string | null
          effective_scope: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          managed_agency_ids: string[] | null
          parent_client_id: string | null
          scope_all_agencies: boolean | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "clients_parent_client_id_fkey"
            columns: ["parent_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_parent_client_id_fkey"
            columns: ["parent_client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
        ]
      }
      formation_formateurs_with_details: {
        Row: {
          certifie: boolean | null
          created_at: string | null
          derniere_intervention: string | null
          formateur_email: string | null
          formateur_id: string | null
          formateur_nom: string | null
          formateur_prenom: string | null
          formation_duration: string | null
          formation_id: string | null
          formation_pole: string | null
          formation_pole_name: string | null
          formation_title: string | null
          id: string | null
          niveau_competence: string | null
          notes: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formation_formateurs_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formation_formateurs_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "public_formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formation_formateurs_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_structure: {
        Row: {
          client_id: string | null
          client_nom: string | null
          client_role: string | null
          client_type: string | null
          department_code: string | null
          department_id: string | null
          department_name: string | null
          employee_department_id: string | null
          employee_id: string | null
          first_name: string | null
          last_name: string | null
          level_order: number | null
          parent_client_id: string | null
          parent_client_nom: string | null
          parent_department_id: string | null
          parent_department_name: string | null
          region: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "client_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "client_users_department_id_fkey"
            columns: ["employee_department_id"]
            isOneToOne: false
            referencedRelation: "client_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_department_id_fkey"
            columns: ["employee_department_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "clients_parent_client_id_fkey"
            columns: ["parent_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_parent_client_id_fkey"
            columns: ["parent_client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
        ]
      }
      public_formateurs: {
        Row: {
          bio: string | null
          id: string | null
          nom: string | null
          prenom: string | null
          specialites: string[] | null
        }
        Insert: {
          bio?: string | null
          id?: string | null
          nom?: string | null
          prenom?: string | null
          specialites?: string[] | null
        }
        Update: {
          bio?: string | null
          id?: string | null
          nom?: string | null
          prenom?: string | null
          specialites?: string[] | null
        }
        Relationships: []
      }
      session_formateurs_detail: {
        Row: {
          confirmed: boolean | null
          confirmed_at: string | null
          created_at: string | null
          formateur_email: string | null
          formateur_id: string | null
          formateur_nom: string | null
          formateur_prenom: string | null
          formateur_specialites: string[] | null
          formateur_telephone: string | null
          groupe_participants: string | null
          id: string | null
          notes: string | null
          role: string | null
          session_end_date: string | null
          session_id: string | null
          session_lieu: string | null
          session_start_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_formateurs_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_formateurs_formateur_id_fkey"
            columns: ["formateur_id"]
            isOneToOne: false
            referencedRelation: "public_formateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_formateurs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants_detail: {
        Row: {
          client_id: string | null
          client_nom: string | null
          client_siret: string | null
          email: string | null
          entreprise_display: string | null
          formation_request_id: string | null
          has_needs_analysis: boolean | null
          inscription_id: string | null
          inscription_status: string | null
          needs_analysis_completed_at: string | null
          needs_analysis_response_id: string | null
          nom: string | null
          poste: string | null
          prenom: string | null
          requested_dates: string | null
          session_end_date: string | null
          session_id: string | null
          session_lieu: string | null
          session_start_date: string | null
          siret_display: string | null
          telephone: string | null
          type_demandeur: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organization_structure"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "inscriptions_formation_request_id_fkey"
            columns: ["formation_request_id"]
            isOneToOne: false
            referencedRelation: "formation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_needs_analysis_response_id_fkey"
            columns: ["needs_analysis_response_id"]
            isOneToOne: false
            referencedRelation: "needs_analysis_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_submit_satisfaction: {
        Args: { p_session_id: string }
        Returns: {
          can_submit: boolean
          inscription_id: string
          reason: string
          session_end_date: string
        }[]
      }
      check_formateur_conflicts: {
        Args: { p_date_debut: string; p_date_fin: string; p_user_id: string }
        Returns: {
          conflict_date: string
          conflict_source: string
          conflict_type: string
          session_title: string
        }[]
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_identifier: string
          p_max_requests: number
          p_window_minutes: number
        }
        Returns: boolean
      }
      cleanup_email_verification_tokens: { Args: never; Returns: undefined }
      cleanup_expired_reset_tokens: { Args: never; Returns: undefined }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      create_inscription_from_request: {
        Args: { p_request_id: string; p_session_id: string }
        Returns: string
      }
      create_inscriptions_from_requests: {
        Args: { p_request_ids: string[]; p_session_id: string }
        Returns: string[]
      }
      detect_region_from_postal_code: {
        Args: { postal_code: string }
        Returns: string
      }
      generate_invitation_token: { Args: never; Returns: string }
      get_admin_notification_counts: {
        Args: { p_is_admin: boolean; p_user_id: string }
        Returns: Json
      }
      get_available_formateurs: {
        Args: { p_date_debut: string; p_date_fin: string }
        Returns: {
          conflict_count: number
          formateur_id: string
          is_available: boolean
          nom: string
          prenom: string
          user_id: string
        }[]
      }
      get_client_sessions_with_details: {
        Args: { p_client_id: string; p_include_children?: boolean }
        Returns: {
          end_date: string
          formation_id: string
          formation_pole_name: string
          formation_title: string
          id: string
          inscriptions_count: number
          lieu: string
          role: string
          start_date: string
          status: string
        }[]
      }
      get_default_needs_analysis_template: {
        Args: never
        Returns: {
          description: string
          id: string
          name: string
          questions: Json
        }[]
      }
      get_dev_request_counts: {
        Args: { request_ids: string[] }
        Returns: {
          comments_count: number
          images_count: number
          request_id: string
        }[]
      }
      get_formateur_client_ids: { Args: never; Returns: string[] }
      get_formateur_formation_ids: { Args: never; Returns: string[] }
      get_formateur_session_ids: { Args: never; Returns: string[] }
      get_global_stats: {
        Args: never
        Returns: {
          clients_count: number
          formateurs_count: number
          formations_count: number
          inscriptions_count: number
          sessions_count: number
        }[]
      }
      get_highest_admin_role: {
        Args: { target_user_id: string }
        Returns: string
      }
      get_inscription_by_needs_analysis_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          formation_title: string
          id: string
          needs_analysis_completed_at: string
          needs_analysis_template_id: string
          nom: string
          prenom: string
          session_id: string
        }[]
      }
      get_inscription_by_tracking: {
        Args: { p_email?: string; p_tracking_code: string }
        Returns: {
          added_by_client: boolean | null
          admin_seen_at: string | null
          adresse: string | null
          civilite: string | null
          client_id: string | null
          contact_privilegie: string | null
          created_at: string
          date_naissance: string | null
          document_prise_en_charge_path: string | null
          email: string
          email_personnel: string | null
          entreprise: string | null
          financement: string | null
          formation_request_id: string | null
          id: string
          image_rights_consent: boolean | null
          needs_analysis_completed_at: string | null
          needs_analysis_response_id: string | null
          needs_analysis_sent_at: string | null
          needs_analysis_template_id: string | null
          needs_analysis_token: string | null
          nom: string
          notes: string | null
          numero_prise_en_charge: string | null
          opco_date_demande: string | null
          opco_date_reponse: string | null
          opco_montant_prise_charge: number | null
          opco_nom: string | null
          opco_notes: string | null
          opco_numero_prise_charge: string | null
          opco_statut: string | null
          poste: string | null
          prenom: string
          responsable_email: string | null
          responsable_nom: string | null
          responsable_prenom: string | null
          responsable_telephone: string | null
          session_id: string
          siret: string | null
          status: string | null
          telephone: string | null
          tracking_code: string | null
          type_inscription: string | null
          updated_at: string
          user_id: string | null
          validation_date: string | null
          validation_justification: string | null
          validation_par: string | null
          validation_statut: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "inscriptions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_managed_client_ids: { Args: { _user_id: string }; Returns: string[] }
      get_needs_analysis_response_by_id: {
        Args: { p_response_id: string }
        Returns: Json
      }
      get_needs_analysis_response_by_inscription: {
        Args: { p_inscription_id: string }
        Returns: Json
      }
      get_needs_analysis_template_by_id: {
        Args: { p_template_id: string }
        Returns: {
          description: string
          id: string
          name: string
          questions: Json
        }[]
      }
      get_security_audit_data: { Args: never; Returns: Json }
      get_session_formateurs: {
        Args: { p_session_id: string }
        Returns: {
          confirmed: boolean
          email: string
          formateur_id: string
          groupe_participants: string
          id: string
          nom: string
          prenom: string
          role: string
          specialites: string[]
        }[]
      }
      get_session_inscription_counts: {
        Args: { p_session_ids: string[] }
        Returns: {
          inscription_count: number
          session_id: string
        }[]
      }
      get_user_accessible_clients: {
        Args: { p_user_id: string }
        Returns: {
          access_level: string
          client_id: string
          client_nom: string
        }[]
      }
      get_user_accessible_departments: {
        Args: { p_user_id: string }
        Returns: {
          access_level: string
          client_id: string
          department_id: string
          department_name: string
        }[]
      }
      get_user_accessible_employees: {
        Args: { p_user_id: string }
        Returns: {
          client_id: string
          client_nom: string
          client_role: string
          department_id: string
          department_name: string
          email: string
          employee_user_id: string
          first_name: string
          last_name: string
        }[]
      }
      get_user_client_ids: { Args: { p_user_id: string }; Returns: string[] }
      get_user_hierarchy_client_ids: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_user_manageable_participants: {
        Args: { p_user_id: string }
        Returns: {
          client_id: string
          client_nom: string
          inscription_id: string
          participant_email: string
          participant_nom: string
          participant_prenom: string
          session_id: string
        }[]
      }
      get_user_organization_ids: { Args: never; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_faq_counter: {
        Args: { p_counter_type: string; p_item_id: string }
        Returns: undefined
      }
      is_client_manager: {
        Args: { _client_id: string; _user_id: string }
        Returns: boolean
      }
      is_client_manager_for_rls: {
        Args: { _client_id: string; _user_id: string }
        Returns: boolean
      }
      is_formateur: { Args: { _user_id?: string }; Returns: boolean }
      is_formateur_profile_complete: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      is_org_manager_for_rls: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
      is_superadmin: { Args: { _user_id?: string }; Returns: boolean }
      log_broken_link: {
        Args: { p_path: string; p_referrer?: string; p_user_agent?: string }
        Returns: undefined
      }
      log_user_change: {
        Args: {
          p_action_type: string
          p_changed_by?: string
          p_field_name?: string
          p_metadata?: Json
          p_new_value?: string
          p_old_value?: string
          p_user_id: string
        }
        Returns: string
      }
      mark_email_verified: { Args: { p_token: string }; Returns: boolean }
      mark_reset_token_used: { Args: { p_token: string }; Returns: boolean }
      submit_needs_analysis_response: {
        Args: { p_responses: Json; p_token: string }
        Returns: Json
      }
      user_can_access_client: {
        Args: { p_client_id: string; p_user_id: string }
        Returns: boolean
      }
      user_manages_organization: {
        Args: { _organization_id: string }
        Returns: boolean
      }
      verify_email_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          is_valid: boolean
          message: string
          user_id: string
        }[]
      }
      verify_reset_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          is_valid: boolean
          message: string
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "org_manager"
        | "client_manager"
        | "superadmin"
        | "formateur"
      client_role_type:
        | "responsable_formation"
        | "directeur_agence"
        | "manager"
        | "collaborateur"
      dev_request_action:
        | "created"
        | "status_changed"
        | "priority_changed"
        | "commented"
        | "image_added"
        | "assigned"
      dev_request_priority: "urgente" | "haute" | "moyenne" | "basse"
      dev_request_status:
        | "nouvelle"
        | "a_trier"
        | "en_cours"
        | "prioritaire"
        | "resolue"
        | "archivee"
      session_action:
        | "created"
        | "status_changed"
        | "formateur_assigned"
        | "formateur_accepted"
        | "formateur_rejected"
        | "formateur_removed"
        | "dates_changed"
        | "location_changed"
        | "client_assigned"
        | "places_changed"
        | "notification_sent"
        | "comment_added"
      session_format_type: "presentiel" | "distanciel" | "elearning"
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
    Enums: {
      app_role: [
        "admin",
        "moderator",
        "user",
        "org_manager",
        "client_manager",
        "superadmin",
        "formateur",
      ],
      client_role_type: [
        "responsable_formation",
        "directeur_agence",
        "manager",
        "collaborateur",
      ],
      dev_request_action: [
        "created",
        "status_changed",
        "priority_changed",
        "commented",
        "image_added",
        "assigned",
      ],
      dev_request_priority: ["urgente", "haute", "moyenne", "basse"],
      dev_request_status: [
        "nouvelle",
        "a_trier",
        "en_cours",
        "prioritaire",
        "resolue",
        "archivee",
      ],
      session_action: [
        "created",
        "status_changed",
        "formateur_assigned",
        "formateur_accepted",
        "formateur_rejected",
        "formateur_removed",
        "dates_changed",
        "location_changed",
        "client_assigned",
        "places_changed",
        "notification_sent",
        "comment_added",
      ],
      session_format_type: ["presentiel", "distanciel", "elearning"],
    },
  },
} as const
