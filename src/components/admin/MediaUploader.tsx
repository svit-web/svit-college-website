import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, File, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  type?: "image" | "file";
  bucketName?: string;
}

export function MediaUploader({
  value,
  onChange,
  type = "image",
  bucketName = "media"
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlDraft, setUrlDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file upload to Supabase Storage
  const uploadFile = async (file: File) => {
    if (!file) return;

    // Optional validation for images
    if (type === "image") {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, WEBP, etc.)");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (["heic", "heif"].includes(ext ?? "") || ["image/heic", "image/heif"].includes(file.type)) {
        toast.error("HEIC/HEIF images are not supported by browsers. Please convert to JPG or PNG first.");
        return;
      }
    }

    setUploading(true);
    try {
      // Create a unique file name under a folder matching the type
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}s/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      // Upload using Supabase Client
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) throw error;

      // Fetch public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      if (urlData?.publicUrl) {
        onChange(urlData.publicUrl);
        toast.success("File uploaded successfully!");
      }
    } catch (err: any) {
      console.error("Storage upload error:", err);
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
    setUrlDraft("");
    setMode("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("data:")) {
      toast.error("Enter a valid URL starting with http:// or https://");
      return;
    }
    onChange(trimmed);
    setUrlDraft("");
    toast.success(`${type === "image" ? "Image" : "File"} URL set`);
  };

  return (
    <div className="space-y-2">
      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={type === "image" ? "image/*" : "*"}
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        // Preview State
        <div className="relative rounded-lg border border-slate-200 bg-slate-50 p-2">
          <div className="flex items-center gap-3">
            {type === "image" ? (
              <div className="relative h-16 w-16 overflow-hidden rounded border border-slate-200 bg-white">
                <img
                  src={value}
                  alt="Upload preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded border border-slate-200 bg-white text-crimson">
                <File className="h-6 w-6" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 font-mono truncate">{value}</p>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs font-semibold text-crimson hover:text-crimson/80 mt-1"
              >
                View Uploaded Asset
              </a>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="rounded-full bg-slate-100 p-1 text-slate-600 hover:bg-red-50 hover:text-red-500 transition"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Mode toggle */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`rounded-md px-3 py-1 transition ${
                mode === "upload" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`rounded-md px-3 py-1 transition ${
                mode === "url" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Paste URL
            </button>
          </div>

          {mode === "upload" ? (
            // Upload Dropzone
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition ${
                dragActive
                  ? "border-crimson bg-crimson/5 text-crimson"
                  : "border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-400 hover:bg-slate-100"
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="h-8 w-8 animate-spin text-crimson" />
                  <p className="text-sm font-medium text-slate-600">Uploading to storage...</p>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-600 border border-slate-200">
                    {type === "image" ? <ImageIcon className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                  </div>
                  <p className="text-sm font-semibold text-navy">
                    Drag & drop or <span className="text-crimson">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports {type === "image" ? "PNG, JPG, WEBP" : "PDF, DOCX, ZIP"} up to 10MB
                  </p>
                </>
              )}
            </div>
          ) : (
            // Paste URL (plain div, not <form> — this component can be nested inside other forms)
            <div className="flex gap-2">
              <input
                type="url"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUrlSubmit(e);
                }}
                placeholder={`https://example.com/${type === "image" ? "photo.jpg" : "file.pdf"}`}
                className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-crimson focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="shrink-0 rounded-lg bg-crimson px-3 py-2 text-xs font-semibold text-white hover:bg-crimson/90 transition"
              >
                Use URL
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
