"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface MediaFile {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  alt_text: string | null;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
  // Computed
  url?: string;
}

interface RawMediaFile {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  alt_text: string | null;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
}

async function fetchMedia(): Promise<MediaFile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  // Build public URLs
  return (data as RawMediaFile[]).map((file): MediaFile => ({
    id: file.id,
    name: file.name,
    file_path: file.file_path,
    file_type: file.file_type,
    file_size: file.file_size,
    alt_text: file.alt_text,
    description: file.description,
    uploaded_by: file.uploaded_by,
    created_at: file.created_at,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${file.file_path}`,
  }));
}

export function useMedia() {
  return useQuery({
    queryKey: ["admin", "media"],
    queryFn: fetchMedia,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Upload security constants
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ALLOWED_EXTENSIONS = [
  "jpg", "jpeg", "png", "webp", "avif", "gif", "svg",
  "pdf", "docx", "xlsx",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024} Mo)`;
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `Type de fichier non autorisé (${file.type})`;
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return `Extension de fichier non autorisée (.${ext})`;
  }

  return null; // OK
}

export function useMediaMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const uploadFile = useMutation({
    mutationFn: async ({ file, folder = "uploads" }: { file: File; folder?: string }) => {
      // Validate file before upload
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      // Sanitize folder name to prevent path traversal
      const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
      const filePath = `${safeFolder}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Create record in media table
      const { error: insertError, data } = await supabase
        .from("media")
        .insert({
          name: file.name,
          file_path: `media/${filePath}`,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });

  const updateMedia = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; alt_text?: string; description?: string } }) => {
      const { error } = await supabase
        .from("media")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });

  const deleteMedia = useMutation({
    mutationFn: async (id: string) => {
      // Get file path first
      const { data: file } = await supabase
        .from("media")
        .select("file_path")
        .eq("id", id)
        .single();

      if (file) {
        // Delete from storage
        const storagePath = file.file_path.replace("media/", "");
        await supabase.storage.from("media").remove([storagePath]);
      }

      // Delete record
      const { error } = await supabase
        .from("media")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });

  return { uploadFile, updateMedia, deleteMedia };
}
