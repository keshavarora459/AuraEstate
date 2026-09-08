/**
 * Property Data Normalizer and Helpers
 * Seamlessly handles both scraped realestate.com.au documents and custom database schema.
 */

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200',
];

export const getPropertyId = (p: any): string => {
  if (!p) return '';
  return String(p._id || p.id || p.external_id || '');
};

export const getPropertyTitle = (p: any): string => {
  if (!p) return 'Luxury Property';
  if (p.title && typeof p.title === 'string' && p.title.trim()) {
    return p.title.trim();
  }
  if (p.street_address && typeof p.street_address === 'string' && p.street_address.trim()) {
    return p.street_address.trim();
  }
  if (p.address && typeof p.address === 'string' && p.address.trim()) {
    const parts = p.address.split(',');
    return parts[0]?.trim() || p.address.trim();
  }
  if (p.address?.street) {
    return p.address.street;
  }
  const beds = p.bedrooms || 2;
  const type = getPropertyType(p);
  const suburb = getPropertySuburb(p);
  return `${beds} Bed ${type} in ${suburb}`;
};

export const getPropertyPrice = (p: any): string => {
  if (!p) return 'Contact Agent';
  if (typeof p.price === 'string' && p.price.trim()) {
    return p.price.trim();
  }
  if (p.price_numeric && Number(p.price_numeric) > 0) {
    return `$${Number(p.price_numeric).toLocaleString()}`;
  }
  if (typeof p.price === 'number' && p.price > 0) {
    const period = p.pricePeriod === 'weekly' || p.listingType === 'Rent' || p.listing_type === 'Rent' ? ' / wk' : '';
    return `$${p.price.toLocaleString()}${period}`;
  }
  return 'Contact Agent';
};

export const getPropertyNumericPrice = (p: any): number => {
  if (!p) return 0;
  if (typeof p.price_numeric === 'number' && p.price_numeric > 0) {
    return p.price_numeric;
  }
  if (typeof p.price === 'number' && p.price > 0) {
    return p.price;
  }
  if (typeof p.price === 'string') {
    const clean = p.price.replace(/[^0-9]/g, '');
    const val = parseInt(clean, 10);
    if (!isNaN(val) && val > 0) return val;
  }
  return 0;
};

export const getPropertyAddress = (p: any): string => {
  if (!p) return 'Australia';
  if (typeof p.address === 'string' && p.address.trim()) {
    return p.address.trim();
  }
  if (p.street_address) {
    const suburb = p.suburb_name || '';
    const state = p.state_code || '';
    const postcode = p.postcode || '';
    return `${p.street_address}, ${suburb} ${state} ${postcode}`.trim();
  }
  if (p.address && typeof p.address === 'object') {
    const parts = [p.address.street, p.address.suburb, p.address.state, p.address.postcode].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  return 'Australia';
};

export const getPropertySuburb = (p: any): string => {
  if (!p) return 'Australia';
  if (p.suburb_name && typeof p.suburb_name === 'string') {
    return p.suburb_name.trim();
  }
  if (p.address?.suburb) {
    return p.address.suburb;
  }
  if (typeof p.address === 'string') {
    const parts = p.address.split(',');
    if (parts.length >= 2) {
      return parts[1].trim();
    }
  }
  return 'Australia';
};

export const getPropertyState = (p: any): string => {
  if (!p) return 'ACT';
  return p.state_code || p.address?.state || 'ACT';
};

export const getPropertyPostcode = (p: any): string => {
  if (!p) return '';
  return String(p.postcode || p.address?.postcode || '');
};

export const getPropertyType = (p: any): string => {
  if (!p) return 'Residential';
  if (p.property_type && typeof p.property_type === 'string') {
    return p.property_type;
  }
  if (p.propertyType && typeof p.propertyType === 'string') {
    return p.propertyType;
  }
  const desc = (p.description || '').toLowerCase();
  const url = (p.url || '').toLowerCase();
  if (desc.includes('apartment') || url.includes('apartment')) return 'Apartment';
  if (desc.includes('townhouse') || url.includes('townhouse')) return 'Townhouse';
  if (desc.includes('villa') || url.includes('villa')) return 'Villa';
  if (desc.includes('penthouse') || url.includes('penthouse')) return 'Penthouse';
  if (desc.includes('house') || url.includes('house')) return 'House';
  return 'Residential';
};

export const getListingType = (p: any): string => {
  if (!p) return 'Sale';
  if (p.status === 'Sold' || p.is_sold) return 'Sold';
  if (p.listing_type) return p.listing_type;
  if (p.listingType) return p.listingType;
  const price = String(p.price || '').toLowerCase();
  if (price.includes('pw') || price.includes('/wk') || price.includes('per week') || price.includes('rent')) {
    return 'Rent';
  }
  return 'Sale';
};

export const getPropertyBedrooms = (p: any): number => {
  if (!p) return 2;
  const raw = p.bedrooms ?? p.bedroom;
  if (raw !== undefined && raw !== null && !isNaN(Number(raw)) && Number(raw) > 0) {
    return Number(raw);
  }
  const text = `${p.title || ''} ${p.description || ''} ${p.land_size || ''} ${p.floor_size || ''}`;
  const m = text.match(/(\d+)\s*(?:bed|bedroom)/i);
  if (m) return parseInt(m[1], 10);
  return 2;
};

export const getPropertyBathrooms = (p: any): number => {
  if (!p) return 2;
  const raw = p.bathrooms ?? p.bathroom;
  const text = `${p.title || ''} ${p.description || ''} ${p.land_size || ''} ${p.floor_size || ''}`;
  const m = text.match(/(\d+)\s*(?:bath|bathroom|ba\b)/i);
  if (m) {
    return parseInt(m[1], 10);
  }
  if (raw !== undefined && raw !== null && !isNaN(Number(raw)) && Number(raw) > 0) {
    return Number(raw);
  }
  return 2;
};

export const getPropertyGarages = (p: any): number => {
  if (!p) return 1;
  const raw = p.garages ?? p.parkingSpaces ?? p.carSpaces;
  const text = `${p.title || ''} ${p.description || ''} ${p.land_size || ''} ${p.floor_size || ''}`;
  const m = text.match(/(\d+)\s*(?:car|garage|parking)/i);
  if (m) {
    return parseInt(m[1], 10);
  }
  if (raw !== undefined && raw !== null && !isNaN(Number(raw)) && Number(raw) > 0) {
    return Number(raw);
  }
  return 1;
};

export const getPropertyLandArea = (p: any): string | null => {
  if (!p) return null;
  const raw = p.land_size || p.landArea || p.block_area;
  if (!raw) return null;

  if (typeof raw === 'number' && raw > 0) {
    return `${raw}m²`;
  }

  const str = String(raw).trim();
  if (!str) return null;

  // Extract metric sizes: 540m², 540 sqm, 540 m2, 1.2 ha, 650 m²
  const match = str.match(/(\d+(?:[.,]\d+)?\s*(?:m²|m2|sqm|sq\s*m|ha|acres?))/i);
  if (match) {
    return match[1].replace(/\s+/g, '').replace(/m2/i, 'm²').replace(/sqm/i, 'm²');
  }

  // Numeric only: "540" -> "540m²"
  if (/^\d+(?:[.,]\d+)?$/.test(str)) {
    return `${str}m²`;
  }

  // Short clean text: e.g. "540 m²"
  if (str.length <= 10 && /\d/.test(str)) {
    return str;
  }

  return null;
};

export const getPropertyFloorArea = (p: any): string | null => {
  if (!p) return null;
  const raw = p.floor_size || p.floorArea;
  if (!raw) return null;

  if (typeof raw === 'number' && raw > 0) {
    return `${raw}m²`;
  }

  const str = String(raw).trim();
  if (!str || str.toLowerCase().includes('floorplans available') || str.toLowerCase().includes('contact')) {
    return null;
  }

  const match = str.match(/(\d+(?:[.,]\d+)?\s*(?:m²|m2|sqm|sq\s*m|ha|acres?))/i);
  if (match) {
    return match[1].replace(/\s+/g, '').replace(/m2/i, 'm²').replace(/sqm/i, 'm²');
  }

  if (/^\d+(?:[.,]\d+)?$/.test(str)) {
    return `${str}m²`;
  }

  if (str.length <= 10 && /\d/.test(str)) {
    return str;
  }

  return null;
};

export const getPropertyImages = (p: any): string[] => {
  if (!p) return FALLBACK_IMAGES;
  if (Array.isArray(p.images) && p.images.length > 0) {
    const valid = p.images.filter((img: any) => typeof img === 'string' && img.startsWith('http'));
    if (valid.length > 0) return valid;
  }
  if (typeof p.image === 'string' && p.image.startsWith('http')) {
    return [p.image];
  }

  // Consistent fallback image based on ID hash
  const idStr = getPropertyId(p);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash + idStr.charCodeAt(i)) % FALLBACK_IMAGES.length;
  }
  return [
    FALLBACK_IMAGES[hash],
    FALLBACK_IMAGES[(hash + 1) % FALLBACK_IMAGES.length],
    FALLBACK_IMAGES[(hash + 2) % FALLBACK_IMAGES.length],
  ];
};

export const getPropertyAgent = (p: any) => {
  if (!p) {
    return {
      name: 'Samantha Reed',
      phone: '+61 480 089 451',
      email: 'agent@auraestate.com.au',
      agency: 'Aura Real Estate',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    };
  }

  let rawName = p.agent_name || p.agentId?.name || 'Samantha Reed';
  // Clean up realestate.com.au prefixes like "What would you like to ask Steph Hoss?"
  cleanName: if (rawName.includes('What would you like to ask')) {
    rawName = rawName.replace(/^What would you like to ask\s*/i, '').replace(/\?+$/, '').trim();
  }

  return {
    name: rawName || 'Samantha Reed',
    phone: p.agent_phone || p.agentId?.phone || '+61 480 089 451',
    email: p.agent_email || p.agentId?.email || 'agent@auraestate.com.au',
    agency: p.agent_agency || p.agencyId?.name || 'Aura Premier Real Estate',
    avatar:
      p.agent_avatar ||
      p.agentId?.avatar ||
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
  };
};
