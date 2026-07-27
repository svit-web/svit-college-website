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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file upload to Supabase Storage
  const uploadFile = async (file: File) => {
    if (!file) return;

    // Optional validation for images
    if (type === "image" && !file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP, etc.)");
      return;
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      )}
    </div>
  );
}
