import { ImagePickerFile } from "@/components/shared/image-picker";

// Helper function to get image URL
export const getImageUrl = (
  file: ImagePickerFile | Record<string, unknown> | null | undefined
) => {
  if (!file) return "";
  return String(file?.path || "");
};

// Convert API file object to ImagePickerFile format
export const toImagePickerFile = (
  file: Record<string, unknown> | null | undefined
): ImagePickerFile | null => {
  if (!file) return null;
  return {
    id: String(file.id || ""),
    path: String(file.path || ""),
    file_name: String(file.file_name || ""),
    mime: String(file.mime || ""),
    size: String(file.size || ""),
  };
};
