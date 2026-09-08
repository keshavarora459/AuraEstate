// Fast in-memory cache for properties to eliminate loading screens
const cache = new Map<string, any>();

export const cacheProperties = (list: any[]) => {
  if (!Array.isArray(list)) return;
  for (const item of list) {
    if (!item) continue;
    const id = item._id || item.id;
    if (id) {
      cache.set(String(id), item);
    }
  }
};

export const cacheProperty = (property: any) => {
  if (!property) return;
  const id = property._id || property.id;
  if (id) {
    cache.set(String(id), property);
  }
};

export const getCachedProperty = (id: string | undefined | null) => {
  if (!id) return null;
  return cache.get(String(id)) || null;
};
