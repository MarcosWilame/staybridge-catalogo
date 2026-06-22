export function isIllustrativePropertyImage(url?: string) {
  return Boolean(url && /images\.unsplash\.com/i.test(url));
}
