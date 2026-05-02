// Cloudinary unsigned upload helper.
// Cloud name and unsigned preset are publishable values — safe in client code.
const CLOUD_NAME = "dz9e4ykla";
const UPLOAD_PRESET = "unsigned_upload";

export type UploadKind = "image" | "audio";

export async function uploadToCloudinary(file: File | Blob, kind: UploadKind): Promise<string> {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", UPLOAD_PRESET);

  // Cloudinary handles audio via the video endpoint.
  const endpoint = kind === "image" ? "image" : "video";
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}/upload`;

  const res = await fetch(url, { method: "POST", body: data });
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try {
      const err = await res.json();
      if (err?.error?.message) msg = err.error.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  const result = (await res.json()) as { secure_url?: string };
  if (!result.secure_url) throw new Error("Upload returned no URL");
  return result.secure_url;
}
