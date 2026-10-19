export const MAX_PHOTOS_PER_ENTRY = 6;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_PATH_PREFIX = "/uploads/journal/";

export const PHOTO_EXTENSIONS_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
