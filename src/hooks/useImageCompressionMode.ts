import { useQuery } from "@tanstack/react-query";
import { getImageCompressionMode, type ImageCompressionMode } from "@/lib/app-settings.functions";

export const IMAGE_COMPRESSION_MODE_QUERY_KEY = ["app-settings", "image_compression_mode"] as const;

export function useImageCompressionMode() {
  const { data, isLoading } = useQuery({
    queryKey: IMAGE_COMPRESSION_MODE_QUERY_KEY,
    queryFn: () => getImageCompressionMode(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  return { mode: (data ?? "client") as ImageCompressionMode, isLoading };
}
