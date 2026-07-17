const API_ORIGIN = import.meta.env.DEV

  ? "https://rnrapi-test.sunbrilotechnologies.com"
  : "http://localhost:5000";

export const DEFAULT_EMPLOYEE_PHOTO = "https://i.pravatar.cc/150";

export function getEmployeePhotoUrl(photo, fallback = DEFAULT_EMPLOYEE_PHOTO) {
  if (!photo) return fallback;

  // Blob URLs are temporary browser previews and must not be used as saved photos.
  if (photo.startsWith("blob:")) {
    return fallback;
  }

  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://") ||
    photo.startsWith("data:")
  ) {
    return photo;
  }

  const normalized = photo.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${API_ORIGIN}/${normalized}`;
}
