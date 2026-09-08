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

export const isKnownMockId = (id: string | undefined | null): boolean => {
  if (!id) return false;
  return String(id).startsWith('507f1f77bcf86cd799439');
};

export const findCachedProperty = (id?: string, title?: string): any | null => {
  if (id && cache.has(String(id))) {
    return cache.get(String(id));
  }

  if (title) {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const item of cache.values()) {
      const itemTitle = (item.title || item.street_address || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (itemTitle && (itemTitle.includes(cleanTitle) || cleanTitle.includes(itemTitle))) {
        return item;
      }
    }
  }

  return null;
};

export const cacheSyntheticProperty = (parsed: any, fallbackImage?: string): any => {
  if (!parsed || !parsed.id) return null;
  const idStr = String(parsed.id);

  if (cache.has(idStr)) {
    return cache.get(idStr);
  }

  const cleanPrice = parsed.price ? parseInt(String(parsed.price).replace(/[^0-9]/g, ''), 10) || 2500000 : 2500000;
  const isRent = String(parsed.price || '').toLowerCase().includes('/wk') || String(parsed.price || '').toLowerCase().includes('/week');

  const synthetic = {
    _id: idStr,
    id: idStr,
    title: parsed.title || 'Luxury Prestige Residence',
    price: cleanPrice,
    price_numeric: cleanPrice,
    pricePeriod: isRent ? 'weekly' : undefined,
    listingType: isRent ? 'Rent' : 'Sale',
    propertyType: parsed.type || 'House',
    bedrooms: parsed.beds || 4,
    bathrooms: parsed.baths || 3,
    garages: 2,
    landArea: 650,
    floorArea: 420,
    address: {
      suburb: parsed.location?.split(',')?.[0]?.trim() || 'Point Piper',
      state: parsed.location?.split(',')?.[1]?.trim() || 'NSW',
      country: 'Australia',
      formattedAddress: parsed.location || 'Point Piper, NSW',
    },
    images: [parsed.image || fallbackImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'],
    description: `A mastercrafted luxury property offering unmatched elegance and state-of-the-art living spaces in ${parsed.location || 'Sydney, NSW'}. Designed with high ceilings, gourmet kitchen, expansive entertainer terraces, and resort-style finishes throughout.`,
    features: ['Air Conditioning', 'Swimming Pool', 'Security System', 'Balcony', 'Ensuite', 'Garage', 'Garden'],
    agent: {
      name: 'Alexander Vance',
      agency: 'Aura Prestige Realty',
      phone: '+61480089451',
      email: 'concierge@auraestate.com.au',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    },
    isSynthetic: true,
  };

  cache.set(idStr, synthetic);
  return synthetic;
};

