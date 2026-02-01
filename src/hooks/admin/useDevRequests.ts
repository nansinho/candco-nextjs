/**
 * @file useDevRequests.ts
 * @description Hook pour la gestion des demandes de développement
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export type DevRequestStatus = 'nouvelle' | 'a_trier' | 'en_cours' | 'prioritaire' | 'resolue' | 'archivee';
export type DevRequestPriority = 'urgente' | 'haute' | 'moyenne' | 'basse';

export interface DevRequest {
  id: string;
  title: string;
  description: string | null;
  status: DevRequestStatus;
  column_slug: string;
  priority: DevRequestPriority;
  column_order: number;
  created_by: string | null;
  assigned_to: string[];
  resolved_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  images?: DevRequestImage[];
  comments_count?: number;
  images_count?: number;
  creator?: { id: string; first_name: string | null; last_name: string | null; } | null;
  assignees?: { id: string; first_name: string | null; last_name: string | null; }[];
}

export interface DevRequestImage {
  id: string;
  request_id: string;
  image_url: string;
  file_name: string | null;
  created_at: string;
  display_url?: string;
}

export interface DevRequestComment {
  id: string;
  request_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user?: { first_name: string | null; last_name: string | null; } | null;
  images?: DevRequestCommentImage[];
}

export interface DevRequestCommentImage {
  id: string;
  comment_id: string;
  image_url: string;
  file_name: string | null;
  created_at: string;
  display_url?: string;
}

export interface DevRequestHistory {
  id: string;
  request_id: string;
  user_id: string | null;
  action_type: 'created' | 'status_changed' | 'priority_changed' | 'commented' | 'image_added' | 'assigned';
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user?: { first_name: string | null; last_name: string | null; } | null;
}

export const STATUS_LABELS: Record<DevRequestStatus, string> = {
  nouvelle: "Nouvelles",
  a_trier: "À tester",
  en_cours: "En cours",
  prioritaire: "Prioritaire",
  resolue: "Résolue",
  archivee: "Archivée",
};

export const PRIORITY_LABELS: Record<DevRequestPriority, string> = {
  urgente: "Urgente",
  haute: "Haute",
  moyenne: "Moyenne",
  basse: "Basse",
};

export const PRIORITY_COLORS: Record<DevRequestPriority, string> = {
  urgente: "bg-destructive/15 text-destructive border-l-4 border-l-destructive",
  haute: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-l-4 border-l-orange-500",
  moyenne: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-l-4 border-l-amber-500",
  basse: "bg-green-500/15 text-green-600 dark:text-green-400 border-l-4 border-l-green-500",
};

export const PRIORITY_BADGE_COLORS: Record<DevRequestPriority, string> = {
  urgente: "bg-destructive/15 text-destructive border-destructive/30",
  haute: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  moyenne: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  basse: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
};

export const KANBAN_COLUMNS: DevRequestStatus[] = ['nouvelle', 'en_cours', 'a_trier'];
export const ACTIVE_COLUMNS: DevRequestStatus[] = ['nouvelle', 'en_cours', 'a_trier'];
export const RESOLVED_COLUMNS: DevRequestStatus[] = ['resolue'];
export const ARCHIVED_COLUMNS: DevRequestStatus[] = ['archivee'];

// Fetch all dev requests
export function useDevRequests(includeResolved = true) {
  return useQuery({
    queryKey: ["dev-requests", includeResolved],
    queryFn: async () => {
      const supabase = createClient();

      let query = supabase
        .from("dev_requests")
        .select("*")
        .is("deleted_at", null)
        .order("column_order", { ascending: true });

      if (!includeResolved) {
        query = query.in("status", ['nouvelle', 'en_cours', 'a_trier']);
      }

      const { data, error } = await query;
      if (error) throw error;

      const requestIds = data?.map(r => r.id) || [];
      if (requestIds.length === 0) return [] as DevRequest[];

      // Collect all user IDs
      const allUserIds = new Set<string>();
      data?.forEach(r => {
        if (r.created_by) allUserIds.add(r.created_by);
        (r.assigned_to as string[] || []).forEach(id => allUserIds.add(id));
      });

      // Fetch counts and profiles in parallel
      const [countsResult, profilesResult] = await Promise.all([
        supabase.rpc('get_dev_request_counts', { request_ids: requestIds }),
        allUserIds.size > 0
          ? supabase
              .from("profiles")
              .select("id, first_name, last_name")
              .in("id", Array.from(allUserIds))
          : Promise.resolve({ data: [] }),
      ]);

      const countsMap: Record<string, { comments: number; images: number }> = {};
      const profilesMap: Record<string, { id: string; first_name: string | null; last_name: string | null }> = {};

      countsResult.data?.forEach((c: { request_id: string; comments_count: number; images_count: number }) => {
        countsMap[c.request_id] = {
          comments: Number(c.comments_count) || 0,
          images: Number(c.images_count) || 0,
        };
      });

      profilesResult.data?.forEach(p => {
        profilesMap[p.id] = p;
      });

      return data?.map(request => ({
        ...request,
        assigned_to: request.assigned_to || [],
        status: request.status as DevRequestStatus,
        column_slug: request.column_slug || request.status,
        priority: request.priority as DevRequestPriority,
        comments_count: countsMap[request.id]?.comments || 0,
        images_count: countsMap[request.id]?.images || 0,
        creator: request.created_by ? profilesMap[request.created_by] || null : null,
        assignees: (request.assigned_to as string[] || [])
          .map(id => profilesMap[id])
          .filter(Boolean),
      })) as DevRequest[];
    },
  });
}

// Fetch a single dev request with full details
export function useDevRequestDetail(requestId: string | null) {
  return useQuery({
    queryKey: ["dev-request", requestId],
    queryFn: async () => {
      if (!requestId) return null;
      const supabase = createClient();

      const { data, error } = await supabase
        .from("dev_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (error) throw error;

      const allUserIds = new Set<string>();
      if (data.created_by) allUserIds.add(data.created_by);
      (data.assigned_to as string[] || []).forEach(id => allUserIds.add(id));

      let profilesMap: Record<string, { id: string; first_name: string | null; last_name: string | null }> = {};
      if (allUserIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", Array.from(allUserIds));

        profiles?.forEach(p => {
          profilesMap[p.id] = p;
        });
      }

      return {
        ...data,
        assigned_to: data.assigned_to || [],
        status: data.status as DevRequestStatus,
        priority: data.priority as DevRequestPriority,
        creator: data.created_by ? profilesMap[data.created_by] || null : null,
        assignees: (data.assigned_to as string[] || [])
          .map(id => profilesMap[id])
          .filter(Boolean),
      } as DevRequest;
    },
    enabled: !!requestId,
  });
}

// Helper to get signed URL for private bucket images
async function getSignedImageUrl(supabase: ReturnType<typeof createClient>, storagePath: string): Promise<string | null> {
  if (storagePath.startsWith('http')) {
    const match = storagePath.match(/\/storage\/v1\/object\/public\/dev-requests\/(.+)$/);
    if (match) {
      const { data } = await supabase.storage.from('dev-requests').createSignedUrl(match[1], 3600);
      return data?.signedUrl || storagePath;
    }
    return storagePath;
  }
  const { data } = await supabase.storage.from('dev-requests').createSignedUrl(storagePath, 3600);
  return data?.signedUrl || null;
}

// Fetch images for a request with signed URLs
export function useDevRequestImages(requestId: string | null) {
  return useQuery({
    queryKey: ["dev-request-images", requestId],
    queryFn: async () => {
      if (!requestId) return [];
      const supabase = createClient();

      const { data, error } = await supabase
        .from("dev_request_images")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const imagesWithSignedUrls = await Promise.all(
        data.map(async (img) => {
          const signedUrl = await getSignedImageUrl(supabase, img.image_url);
          return {
            ...img,
            display_url: signedUrl || img.image_url,
          };
        })
      );

      return imagesWithSignedUrls as (DevRequestImage & { display_url: string })[];
    },
    enabled: !!requestId,
  });
}

// Fetch list of admin users for assignment
export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const supabase = createClient();

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["admin", "superadmin"]);

      if (roleError) throw roleError;

      const userIds = roleData?.map(r => r.user_id) || [];
      if (userIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);

      if (profileError) throw profileError;

      return profiles || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch comments for a request
export function useDevRequestComments(requestId: string | null) {
  return useQuery({
    queryKey: ["dev-request-comments", requestId],
    queryFn: async () => {
      if (!requestId) return [];
      const supabase = createClient();

      const { data: comments, error } = await supabase
        .from("dev_request_comments")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!comments || comments.length === 0) return [];

      const commentIds = comments.map(c => c.id);
      const { data: imagesData } = await supabase
        .from("dev_request_comment_images")
        .select("*")
        .in("comment_id", commentIds);

      const imagesWithSignedUrls = await Promise.all(
        (imagesData || []).map(async (img) => {
          const signedUrl = await getSignedImageUrl(supabase, img.image_url);
          return {
            ...img,
            display_url: signedUrl || img.image_url,
          };
        })
      );

      const imagesByComment: Record<string, (DevRequestCommentImage & { display_url: string })[]> = {};
      imagesWithSignedUrls.forEach(img => {
        if (!imagesByComment[img.comment_id]) {
          imagesByComment[img.comment_id] = [];
        }
        imagesByComment[img.comment_id].push(img);
      });

      const userIds = [...new Set(comments.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);

      const profilesMap = Object.fromEntries(
        (profiles || []).map(p => [p.id, p])
      );

      return comments.map(comment => ({
        ...comment,
        user: profilesMap[comment.user_id] || null,
        images: imagesByComment[comment.id] || [],
      })) as DevRequestComment[];
    },
    enabled: !!requestId,
  });
}

// Fetch history for a request
export function useDevRequestHistory(requestId: string | null) {
  return useQuery({
    queryKey: ["dev-request-history", requestId],
    queryFn: async () => {
      if (!requestId) return [];
      const supabase = createClient();

      const { data, error } = await supabase
        .from("dev_request_history")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const userIds = [...new Set(data.filter(h => h.user_id).map(h => h.user_id!))];
      const { data: profiles } = userIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .in("id", userIds)
        : { data: [] };

      const profilesMap = Object.fromEntries(
        (profiles || []).map(p => [p.id, p])
      );

      return data.map(h => ({
        ...h,
        action_type: h.action_type as DevRequestHistory['action_type'],
        user: h.user_id ? profilesMap[h.user_id] || null : null,
      })) as DevRequestHistory[];
    },
    enabled: !!requestId,
  });
}

// Helper to get user display name
async function getUserDisplayName(supabase: ReturnType<typeof createClient>, userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", userId)
    .single();

  if (profile) {
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Un utilisateur';
  }
  return 'Un utilisateur';
}

// Create a new dev request
export function useCreateDevRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      priority?: DevRequestPriority;
      images?: File[];
      assigned_to?: string[];
    }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: request, error } = await supabase
        .from("dev_requests")
        .insert({
          title: data.title,
          description: data.description || null,
          priority: data.priority || 'moyenne',
          created_by: user.id,
          assigned_to: data.assigned_to || [],
        })
        .select()
        .single();

      if (error) throw error;

      // Upload images if present
      const uploadedImages: { storagePath: string; fileName: string }[] = [];
      const failedImages: string[] = [];

      if (data.images && data.images.length > 0) {
        for (const image of data.images) {
          const fileExt = image.name.split('.').pop();
          const storagePath = `request-images/${request.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('dev-requests')
            .upload(storagePath, image);

          if (uploadError) {
            console.error("Erreur upload image:", uploadError);
            failedImages.push(image.name);
            continue;
          }

          uploadedImages.push({ storagePath, fileName: image.name });
        }

        for (const { storagePath, fileName } of uploadedImages) {
          await supabase.from("dev_request_images").insert({
            request_id: request.id,
            image_url: storagePath,
            file_name: fileName,
          });
        }

        if (uploadedImages.length > 0) {
          await supabase.from("dev_request_history").insert({
            request_id: request.id,
            user_id: user.id,
            action_type: 'image_added',
            new_value: `${uploadedImages.length} image(s) ajoutée(s) à la création`,
          });
        }

        if (failedImages.length > 0) {
          toast.warning(`${failedImages.length} image(s) n'ont pas pu être uploadées: ${failedImages.join(', ')}`);
        }
      }

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-requests"] });
      toast.success("Demande créée avec succès");
    },
    onError: (error) => {
      console.error("Erreur création demande:", error);
      toast.error("Erreur lors de la création de la demande");
    },
  });
}

// Update a dev request
export function useUpdateDevRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      description?: string;
      status?: DevRequestStatus;
      column_slug?: string;
      priority?: DevRequestPriority;
      column_order?: number;
      assigned_to?: string[];
      previousAssignedTo?: string[];
    }) => {
      const supabase = createClient();

      const updates: Record<string, unknown> = {};
      if (data.title !== undefined) updates.title = data.title;
      if (data.description !== undefined) updates.description = data.description;
      if (data.column_slug !== undefined) {
        updates.column_slug = data.column_slug;
        const validStatuses = ['nouvelle', 'a_trier', 'en_cours', 'prioritaire', 'resolue', 'archivee'];
        if (validStatuses.includes(data.column_slug)) {
          updates.status = data.column_slug;
        }
        if (data.column_slug === 'resolue' || data.column_slug === 'archivee') {
          updates.resolved_at = new Date().toISOString();
        }
      }
      if (data.status !== undefined) {
        updates.status = data.status;
        updates.column_slug = data.status;
        if (data.status === 'resolue' || data.status === 'archivee') {
          updates.resolved_at = new Date().toISOString();
        }
      }
      if (data.priority !== undefined) updates.priority = data.priority;
      if (data.column_order !== undefined) updates.column_order = data.column_order;
      if (data.assigned_to !== undefined) updates.assigned_to = data.assigned_to;

      const { data: request, error } = await supabase
        .from("dev_requests")
        .update(updates)
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dev-request"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    },
  });
}

// Add a comment
export function useAddDevRequestComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      request_id: string;
      content: string;
      images?: File[];
    }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: comment, error } = await supabase
        .from("dev_request_comments")
        .insert({
          request_id: data.request_id,
          user_id: user.id,
          content: data.content,
        })
        .select()
        .single();

      if (error) throw error;

      let uploadedCount = 0;
      if (data.images && data.images.length > 0) {
        for (const file of data.images) {
          const storagePath = `comments/${comment.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("dev-requests")
            .upload(storagePath, file);

          if (!uploadError) {
            uploadedCount++;
            await supabase.from("dev_request_comment_images").insert({
              comment_id: comment.id,
              image_url: storagePath,
              file_name: file.name,
            });
          }
        }
      }

      await supabase.from("dev_request_history").insert({
        request_id: data.request_id,
        user_id: user.id,
        action_type: 'commented',
        new_value: data.content.substring(0, 100),
        old_value: uploadedCount > 0 ? `${uploadedCount}` : null,
      });

      return comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dev-request-comments", variables.request_id] });
      queryClient.invalidateQueries({ queryKey: ["dev-request-history", variables.request_id] });
      queryClient.invalidateQueries({ queryKey: ["dev-requests"] });
      toast.success("Commentaire ajouté");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout du commentaire");
      console.error(error);
    },
  });
}

// Delete a comment
export function useDeleteDevRequestComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; requestId: string }) => {
      const supabase = createClient();

      const { data: images } = await supabase
        .from("dev_request_comment_images")
        .select("image_url")
        .eq("comment_id", data.id);

      if (images && images.length > 0) {
        for (const img of images) {
          let storagePath: string | null = null;
          if (img.image_url.startsWith('http')) {
            const match = img.image_url.match(/\/storage\/v1\/object\/public\/dev-requests\/(.+)$/);
            storagePath = match ? match[1] : null;
          } else {
            storagePath = img.image_url;
          }
          if (storagePath) {
            await supabase.storage.from("dev-requests").remove([storagePath]);
          }
        }
        await supabase
          .from("dev_request_comment_images")
          .delete()
          .eq("comment_id", data.id);
      }

      const { error } = await supabase
        .from("dev_request_comments")
        .delete()
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dev-request-comments", variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ["dev-requests"] });
      toast.success("Commentaire supprimé");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });
}

// Soft delete a dev request
export function useDeleteDevRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("dev_requests")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-requests"] });
      toast.success("Demande déplacée dans la corbeille");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });
}

// Batch update column orders
export function useBatchUpdateColumnOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; column_order: number; column_slug?: string }[]) => {
      const supabase = createClient();

      for (const update of updates) {
        const updateData: Record<string, unknown> = { column_order: update.column_order };
        if (update.column_slug) {
          updateData.column_slug = update.column_slug;
          const validStatuses = ['nouvelle', 'a_trier', 'en_cours', 'prioritaire', 'resolue', 'archivee'];
          if (validStatuses.includes(update.column_slug)) {
            updateData.status = update.column_slug;
          }
          if (update.column_slug === 'resolue' || update.column_slug === 'archivee') {
            updateData.resolved_at = new Date().toISOString();
          }
        }

        const { error } = await supabase
          .from("dev_requests")
          .update(updateData)
          .eq("id", update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-requests"] });
    },
  });
}

// =====================================================
// Dynamic Kanban Columns Management
// =====================================================

export interface DevRequestColumn {
  id: string;
  name: string;
  slug: string;
  position: number;
  color: string | null;
  is_system: boolean;
  is_default: boolean;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch all Kanban columns
export function useDevRequestColumns() {
  return useQuery({
    queryKey: ["dev-request-columns"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("dev_request_columns")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      return data as DevRequestColumn[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Create a new Kanban column
export function useCreateDevRequestColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      slug: string;
      color?: string;
      position: number;
    }) => {
      const supabase = createClient();
      const { data: column, error } = await supabase
        .from("dev_request_columns")
        .insert({
          name: data.name,
          slug: data.slug,
          color: data.color || null,
          position: data.position,
          is_system: false,
          is_default: false,
          is_resolved: false,
        })
        .select()
        .single();

      if (error) throw error;
      return column as DevRequestColumn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-request-columns"] });
      toast.success("Colonne créée");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la colonne");
      console.error(error);
    },
  });
}

// Update a Kanban column
export function useUpdateDevRequestColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      color?: string | null;
      position?: number;
    }) => {
      const supabase = createClient();
      const updates: Record<string, unknown> = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.color !== undefined) updates.color = data.color;
      if (data.position !== undefined) updates.position = data.position;

      const { data: column, error } = await supabase
        .from("dev_request_columns")
        .update(updates)
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return column as DevRequestColumn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-request-columns"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de la colonne");
      console.error(error);
    },
  });
}

// Delete a Kanban column
export function useDeleteDevRequestColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (columnId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("dev_request_columns")
        .delete()
        .eq("id", columnId)
        .eq("is_system", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-request-columns"] });
      toast.success("Colonne supprimée");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression de la colonne");
      console.error(error);
    },
  });
}

// =====================================================
// Trash / Archive / Resolved Management
// =====================================================

// Fetch soft-deleted dev requests (trash)
export function useDeletedDevRequests() {
  return useQuery({
    queryKey: ["dev-requests-deleted"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("dev_requests")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (error) throw error;

      const creatorIds = [...new Set(data?.map(r => r.created_by).filter(Boolean))];
      let profilesMap: Record<string, { id: string; first_name: string | null; last_name: string | null }> = {};

      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", creatorIds as string[]);

        profiles?.forEach(p => {
          profilesMap[p.id] = p;
        });
      }

      return data?.map(request => ({
        ...request,
        assigned_to: request.assigned_to || [],
        status: request.status as DevRequestStatus,
        priority: request.priority as DevRequestPriority,
        creator: request.created_by ? profilesMap[request.created_by] || null : null,
      })) as DevRequest[];
    },
  });
}

// Fetch resolved dev requests
export function useResolvedDevRequests() {
  return useQuery({
    queryKey: ["dev-requests-resolved"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("dev_requests")
        .select("*")
        .is("deleted_at", null)
        .eq("status", "resolue")
        .order("resolved_at", { ascending: false });

      if (error) throw error;

      const creatorIds = [...new Set(data?.map(r => r.created_by).filter(Boolean))];
      let profilesMap: Record<string, { id: string; first_name: string | null; last_name: string | null }> = {};

      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", creatorIds as string[]);

        profiles?.forEach(p => {
          profilesMap[p.id] = p;
        });
      }

      return data?.map(request => ({
        ...request,
        assigned_to: request.assigned_to || [],
        status: request.status as DevRequestStatus,
        priority: request.priority as DevRequestPriority,
        creator: request.created_by ? profilesMap[request.created_by] || null : null,
      })) as DevRequest[];
    },
  });
}

// Fetch archived dev requests
export function useArchivedDevRequests() {
  return useQuery({
    queryKey: ["dev-requests-archived"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("dev_requests")
        .select("*")
        .is("deleted_at", null)
        .eq("status", "archivee")
        .order("resolved_at", { ascending: false });

      if (error) throw error;

      const creatorIds = [...new Set(data?.map(r => r.created_by).filter(Boolean))];
      let profilesMap: Record<string, { id: string; first_name: string | null; last_name: string | null }> = {};

      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", creatorIds as string[]);

        profiles?.forEach(p => {
          profilesMap[p.id] = p;
        });
      }

      return data?.map(request => ({
        ...request,
        assigned_to: request.assigned_to || [],
        status: request.status as DevRequestStatus,
        priority: request.priority as DevRequestPriority,
        creator: request.created_by ? profilesMap[request.created_by] || null : null,
      })) as DevRequest[];
    },
  });
}

// Restore a soft-deleted dev request
export function useRestoreDevRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("dev_requests")
        .update({
          deleted_at: null,
          status: 'nouvelle' as DevRequestStatus,
          column_slug: 'nouvelle',
        })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dev-requests-deleted"] });
      toast.success("Demande restaurée");
    },
    onError: (error) => {
      toast.error("Erreur lors de la restauration");
      console.error(error);
    },
  });
}

// Permanently delete a dev request
export function usePermanentDeleteDevRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("dev_requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-requests-deleted"] });
      toast.success("Demande supprimée définitivement");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression définitive");
      console.error(error);
    },
  });
}

// Empty trash (permanently delete all soft-deleted requests)
export function useEmptyTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("dev_requests")
        .delete()
        .not("deleted_at", "is", null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-requests-deleted"] });
      toast.success("Corbeille vidée");
    },
    onError: (error) => {
      toast.error("Erreur lors du vidage de la corbeille");
      console.error(error);
    },
  });
}

// Archive a resolved request
export function useArchiveDevRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("dev_requests")
        .update({ status: 'archivee', column_slug: 'archivee' })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dev-requests-resolved"] });
      queryClient.invalidateQueries({ queryKey: ["dev-requests-archived"] });
      toast.success("Demande archivée");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'archivage");
      console.error(error);
    },
  });
}
