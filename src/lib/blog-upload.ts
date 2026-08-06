import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";

/** Uploads an image to the private blog bucket and returns a permanent public URL. */
export async function uploadBlogImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Format non supporté : choisissez une image.");
  }

  let payload: Blob = file;
  try {
    payload = await imageCompression(file, {
      maxSizeMB: 0.9,
      maxWidthOrHeight: 1800,
      useWebWorker: true,
      fileType: "image/jpeg",
    });
  } catch {
    payload = file;
  }

  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, payload, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;

  return `/api/public/blog-image/${path}`;
}
