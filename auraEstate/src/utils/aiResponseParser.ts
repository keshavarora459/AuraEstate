/**
 * AI Response Parser for AuraEstate
 * Robustly parses AI responses into typed, structured content blocks
 * (Properties, Single Property, Suburb Insights, Mortgage Calculations, Market Stats, Agent Lists, Step Guides, Clean Text)
 */

export interface ParsedProperty {
  id: string;
  title: string;
  type?: string;
  location?: string;
  beds?: number;
  baths?: number;
  parking?: number;
  price?: string;
  numericPrice?: number;
  image?: string;
  isCheapest?: boolean;
  isMostExpensive?: boolean;
}

export interface ParsedMortgage {
  propertyPrice?: string;
  deposit?: string;
  loanAmount?: string;
  interestRate?: string;
  loanTerm?: string;
  monthlyRepayment: string;
  note?: string;
}

export interface ParsedSuburbInsight {
  suburb: string;
  state?: string;
  averagePrice?: string;
  listingsCount?: string;
  recentSales?: string;
  overview?: string;
}

export interface ParsedStat {
  label: string;
  value: string;
  icon?: string;
}

export interface ParsedAgent {
  name: string;
  agency?: string;
  precinct?: string;
  phone?: string;
  email?: string;
}

export interface ParsedStep {
  number: number;
  title: string;
  description: string;
  linkText?: string;
  linkUrl?: string;
}

export type AIBlock =
  | { type: 'property_list'; properties: ParsedProperty[]; title?: string }
  | { type: 'single_property'; property: ParsedProperty; highlightTitle: string; subtitle?: string }
  | { type: 'suburb_insight'; insight: ParsedSuburbInsight }
  | { type: 'mortgage_summary'; mortgage: ParsedMortgage }
  | { type: 'market_stats'; stats: ParsedStat[]; title?: string; explanation?: string }
  | { type: 'agent_list'; agents: ParsedAgent[]; title?: string }
  | { type: 'step_guide'; steps: ParsedStep[]; title?: string }
  | { type: 'formatted_text'; content: string };

export interface ParsedAIResponse {
  introText?: string;
  blocks: AIBlock[];
  outroText?: string;
}

/**
 * Clean markdown symbols for display (e.g. removes **bold**, [text](url) -> text, etc.)
 */
export function cleanRawMarkdown(text: string): string {
  if (!text) return '';
  let cleaned = text;
  // Replace markdown links [Text](url) with just Text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove bold/italic markers
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  // Remove markdown headers #, ##, ###
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  // Remove blockquote markers
  cleaned = cleaned.replace(/^>\s+/gm, '');
  // Remove trailing artifacts like "Click any property title above..."
  cleaned = cleaned.replace(/Click (?:any|View Property)[^\n.]*[.!]?/gi, '').trim();
  return cleaned.trim();
}

/**
 * Helper to clean a title string
 */
function cleanTitle(raw: string): string {
  let t = raw.trim();
  t = t.replace(/^[*"']+|[*"']+$/g, '').trim();
  t = t.replace(/^\*\*(.*?)\*\*$/, '$1').trim();
  return t;
}

/**
 * Helper to format prices consistently
 */
function normalizePrice(raw: string): string {
  if (!raw) return 'Contact Agent';
  let p = raw.trim();
  // Strip markdown
  p = p.replace(/\*\*/g, '').trim();
  if (!p.toUpperCase().includes('AUD') && !p.includes('$')) {
    p = `AUD $${p}`;
  } else if (!p.toUpperCase().includes('AUD') && p.includes('$')) {
    p = `AUD ${p}`;
  }
  return p;
}

/**
 * 1. Extract properties from markdown text (lists, tables, inline mentions)
 */
function extractProperties(text: string): ParsedProperty[] {
  const properties: ParsedProperty[] = [];
  const seenIds = new Set<string>();

  // Pattern A: Table rows -> | [**Title**](/properties/ID) | Type | Suburb | Specs | Price | ... |
  const tableRowRegex = /\|\s*\[\**"?([^\]"]+)"?\**\]\(\/properties\/([a-zA-Z0-9_-]+)\)\s*\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|/g;
  let match: RegExpExecArray | null;

  while ((match = tableRowRegex.exec(text)) !== null) {
    const rawTitle = match[1];
    const id = match[2];
    const rawType = match[3]?.trim();
    const rawSuburb = match[4]?.trim();
    const rawSpecs = match[5]?.trim();
    const rawPrice = match[6]?.trim();

    if (!seenIds.has(id)) {
      seenIds.add(id);

      const bedsMatch = rawSpecs.match(/(\d+)\s*(?:bed|beds|Beds)/i);
      const bathsMatch = rawSpecs.match(/(\d+)\s*(?:bath|baths|Baths)/i);

      properties.push({
        id,
        title: cleanTitle(rawTitle),
        type: rawType || 'Luxury Residence',
        location: rawSuburb || 'Sydney, NSW',
        beds: bedsMatch ? parseInt(bedsMatch[1], 10) : undefined,
        baths: bathsMatch ? parseInt(bathsMatch[1], 10) : undefined,
        price: normalizePrice(rawPrice),
      });
    }
  }

  // Pattern B: List lines or paragraph lines with [Title](/properties/ID)
  // e.g.: 1. [**The Grand Waterfront Villa**](/properties/123) — Point Piper, NSW | 6 bed, 7 bath | AUD $18,500,000 → [View Property]
  const listLineRegex = /(?:^|\n)(?:(?:\d+\.|\*|-)\s*)?\[\**"?([^\]"]+)"?\**\]\(\/properties\/([a-zA-Z0-9_-]+)\)([^\n]*)/g;
  while ((match = listLineRegex.exec(text)) !== null) {
    const rawTitle = match[1];
    const id = match[2];
    const rest = match[3] || '';

    if (!seenIds.has(id)) {
      seenIds.add(id);

      // Extract location: after "—" or "in"
      let location = '';
      const dashLocMatch = rest.match(/—\s*([^|—]+)/);
      const inLocMatch = rest.match(/\bin\s+([A-Za-z\s,]+?)(?:\s+at|\s*\||\s*—|$)/i);
      if (dashLocMatch) {
        location = dashLocMatch[1].trim();
      } else if (inLocMatch) {
        location = inLocMatch[1].trim();
      }

      // Extract beds and baths
      const bedsMatch = rest.match(/(\d+)\s*(?:bed|beds|bedroom|bedrooms)/i);
      const bathsMatch = rest.match(/(\d+)\s*(?:bath|baths|bathroom|bathrooms)/i);

      // Extract price
      const priceMatch = rest.match(/(?:AUD\s*)?\$[\d,]+(?:\/[\w]+)?/i);

      // Extract type
      let type: string | undefined;
      const typeMatch = rest.match(/\b(Villa|Apartment|Penthouse|House|Townhouse|Estate|Residential|Commercial|Farm)\b/i);
      if (typeMatch) {
        type = typeMatch[1];
      }

      properties.push({
        id,
        title: cleanTitle(rawTitle),
        type: type || 'Luxury Residence',
        location: location || 'Australia',
        beds: bedsMatch ? parseInt(bedsMatch[1], 10) : undefined,
        baths: bathsMatch ? parseInt(bathsMatch[1], 10) : undefined,
        price: priceMatch ? normalizePrice(priceMatch[0]) : 'Contact Agent',
      });
    }
  }

  // Pattern C: General link fallback if any /properties/ID wasn't caught yet
  const generalLinkRegex = /\[\**"?([^\]"]+)"?\**\]\(\/properties\/([a-zA-Z0-9_-]+)\)/g;
  while ((match = generalLinkRegex.exec(text)) !== null) {
    const rawTitle = match[1];
    const id = match[2];

    if (!seenIds.has(id)) {
      // Ignore generic "View Property" links
      if (/view\s*property/i.test(rawTitle)) continue;

      seenIds.add(id);
      properties.push({
        id,
        title: cleanTitle(rawTitle),
        type: 'Luxury Residence',
        location: 'Australia',
        price: 'Contact Agent',
      });
    }
  }

  return properties;
}

/**
 * 2. Extract Agents from table
 */
function extractAgents(text: string): ParsedAgent[] {
  const agents: ParsedAgent[] = [];
  if (!text.toLowerCase().includes('agent name') && !text.toLowerCase().includes('verified platform agents')) {
    return agents;
  }

  const agentRowRegex = /\|\s*([A-Za-z\s.]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g;
  let match: RegExpExecArray | null;

  while ((match = agentRowRegex.exec(text)) !== null) {
    const name = match[1].trim();
    if (name.toLowerCase().includes('agent name') || name.startsWith(':---') || name.startsWith('---')) {
      continue;
    }
    agents.push({
      name,
      agency: match[2].trim(),
      precinct: match[3].trim(),
      phone: match[4].trim(),
      email: match[5].trim(),
    });
  }

  return agents;
}

/**
 * 3. Extract Mortgage calculation
 */
function extractMortgage(text: string): ParsedMortgage | null {
  const lower = text.toLowerCase();
  const isMortgageQuery =
    lower.includes('mortgage') ||
    lower.includes('repayment') ||
    (lower.includes('interest rate') && lower.includes('loan'));

  if (!isMortgageQuery) return null;

  // Monthly repayment match: e.g. "$3,880/month" or "$4,895 / month" or "costs approx $3,880"
  const monthlyMatch = text.match(/(?:repayment|costs approx|estimated monthly repayment|costs)[:\s]*(\$?[\d,]+(?:\.\d+)?)\s*(?:\/|\s*per\s*)?(?:month|mo)?/i)
    || text.match(/(\$?[\d,]+)\s*\/\s*month/i);

  if (!monthlyMatch) return null;

  const rawMonthly = monthlyMatch[1].startsWith('$') ? monthlyMatch[1] : `$${monthlyMatch[1]}`;

  // Loan amount
  const loanMatch = text.match(/(?:loan amount|mortgage)[:\s]*(\$?[\d,]+)/i)
    || text.match(/an?\s*(\$?[\d,]+)\s*mortgage/i);

  // Interest rate
  const rateMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);

  // Term
  const termMatch = text.match(/(\d+)\s*(?:years?|yrs?)/i);

  // Property price
  const priceMatch = text.match(/(?:property price|purchase price)[:\s]*(\$?[\d,]+)/i);

  // Deposit
  const depositMatch = text.match(/(?:deposit)[:\s]*(\$?[\d,]+)/i);

  return {
    propertyPrice: priceMatch ? (priceMatch[1].startsWith('$') ? priceMatch[1] : `$${priceMatch[1]}`) : undefined,
    deposit: depositMatch ? (depositMatch[1].startsWith('$') ? depositMatch[1] : `$${depositMatch[1]}`) : undefined,
    loanAmount: loanMatch ? (loanMatch[1].startsWith('$') ? loanMatch[1] : `$${loanMatch[1]}`) : undefined,
    interestRate: rateMatch ? `${rateMatch[1]}%` : undefined,
    loanTerm: termMatch ? `${termMatch[1]} years` : '30 years',
    monthlyRepayment: `${rawMonthly} / month`,
    note: 'This is an estimate only and not financial advice.',
  };
}

/**
 * 4. Extract Suburb / Location Insights
 */
function extractSuburbInsight(text: string): ParsedSuburbInsight | null {
  const lower = text.toLowerCase();
  // Check for market overview or suburb format
  const hasSuburbClues =
    (lower.includes('market overview') || lower.includes('average property price') || lower.includes('median price') || lower.includes('suburb')) &&
    (lower.includes('price') || lower.includes('properties available') || lower.includes('sales'));

  if (!hasSuburbClues) return null;

  // Find suburb name: ### Point Piper, NSW or "Point Piper is an exclusive..."
  let suburb = '';
  const headingMatch = text.match(/###\s*([A-Za-z\s]+)(?:,\s*([A-Z]{2,3}))?/i);
  if (headingMatch) {
    suburb = headingMatch[1].trim() + (headingMatch[2] ? `, ${headingMatch[2].trim()}` : '');
  } else {
    const introMatch = text.match(/^([A-Za-z\s]+)(?:,\s*([A-Z]{2,3}))?\s+is\s+/i);
    if (introMatch) {
      suburb = introMatch[1].trim() + (introMatch[2] ? `, ${introMatch[2].trim()}` : '');
    }
  }

  if (!suburb) {
    // Fallback: look for Sydney, Melbourne, Point Piper, Barangaroo etc.
    const cityMatch = text.match(/\b(Point Piper|Barangaroo|Vaucluse|Bondi|Mosman|Double Bay|Paddington|Sydney|Melbourne|Brisbane|Canberra)\b/i);
    if (cityMatch) {
      suburb = cityMatch[1];
    }
  }

  if (!suburb) return null;

  // Average or Median Price
  const avgPriceMatch = text.match(/(?:average property price|median price|average price)[:\s]*([AUD\s]*\$?[\d,.]+(?:\s*[MBKmbk])?)/i);
  // Properties count
  const countMatch = text.match(/(?:properties available|active listings|listings)[:\s]*(\d+)/i);
  // Recent sales
  const salesMatch = text.match(/(?:recent sales)[:\s]*(\d+)/i);

  // Overview paragraph
  const cleanOverview = cleanRawMarkdown(
    text
      .replace(/###[^\n]+/g, '')
      .replace(/Market Overview/gi, '')
      .replace(/(?:Average|Median)[^\n]+/gi, '')
      .replace(/(?:Properties available|Listings)[^\n]+/gi, '')
      .replace(/(?:Recent sales)[^\n]+/gi, '')
  );

  return {
    suburb,
    averagePrice: avgPriceMatch ? avgPriceMatch[1].trim() : undefined,
    listingsCount: countMatch ? countMatch[1].trim() : undefined,
    recentSales: salesMatch ? salesMatch[1].trim() : undefined,
    overview: cleanOverview.slice(0, 260),
  };
}

/**
 * 5. Extract Step-by-Step Guides (e.g. How to buy)
 */
function extractStepGuide(text: string): ParsedStep[] {
  const steps: ParsedStep[] = [];
  const lower = text.toLowerCase();
  if (!lower.includes('step') && !lower.includes('how to buy') && !lower.includes('browse listings')) {
    return steps;
  }

  const stepRegex = /(\d+)\.\s*\**([^*:\n]+)\**[:\-—]\s*([^\n]+)/g;
  let match: RegExpExecArray | null;

  while ((match = stepRegex.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    const title = cleanTitle(match[2]);
    let desc = match[3].trim();

    // Check for link in desc
    let linkText: string | undefined;
    let linkUrl: string | undefined;
    const linkMatch = desc.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      linkText = linkMatch[1];
      linkUrl = linkMatch[2];
      desc = desc.replace(/\[([^\]]+)\]\([^)]+\)/, linkText);
    }

    desc = cleanRawMarkdown(desc);

    steps.push({
      number: num,
      title,
      description: desc,
      linkText,
      linkUrl,
    });
  }

  return steps;
}

/**
 * 6. Extract Market Stats (e.g. Total properties, For Sale, For Rent)
 */
function extractMarketStats(text: string): ParsedStat[] | null {
  const lower = text.toLowerCase();
  if (!lower.includes('published properties') && !lower.includes('median price') && !lower.includes('recent sales')) {
    return null;
  }

  const stats: ParsedStat[] = [];

  // Pattern: "AuraEstates currently has **12** published properties — including 8 for sale and 4 for rent"
  const publishedMatch = text.match(/(?:currently has\s*|\b)(\d+)\s*(?:\*\*)?\s*published properties/i)
    || text.match(/\*\*(\d+)\*\*\s*published properties/i);
  const forSaleMatch = text.match(/(\d+)\s*for sale/i);
  const forRentMatch = text.match(/(\d+)\s*for rent/i);

  if (publishedMatch) {
    stats.push({ label: 'Total Listings', value: publishedMatch[1], icon: 'business-outline' });
  }
  if (forSaleMatch) {
    stats.push({ label: 'For Sale', value: forSaleMatch[1], icon: 'pricetag-outline' });
  }
  if (forRentMatch) {
    stats.push({ label: 'For Rent', value: forRentMatch[1], icon: 'key-outline' });
  }

  // Pattern: Median Price: $X, Listings: Y, Recent Sales: Z
  const medianMatch = text.match(/Median Price[:\s]*(\$?[\d,.]+[MBKmbk]?)/i);
  const listMatch = text.match(/Listings[:\s]*(\d+)/i);
  const salesMatch = text.match(/Recent Sales[:\s]*(\d+)/i);

  if (medianMatch && stats.length === 0) {
    stats.push({ label: 'Median Price', value: medianMatch[1], icon: 'trending-up-outline' });
  }
  if (listMatch && stats.length < 3) {
    stats.push({ label: 'Listings', value: listMatch[1], icon: 'home-outline' });
  }
  if (salesMatch && stats.length < 3) {
    stats.push({ label: 'Recent Sales', value: salesMatch[1], icon: 'checkmark-circle-outline' });
  }

  return stats.length >= 2 ? stats : null;
}

/**
 * Main parser function: takes raw AI text response and produces a structured ParsedAIResponse
 */
export function parseAIResponse(text: string): ParsedAIResponse {
  if (!text || typeof text !== 'string') {
    return { blocks: [{ type: 'formatted_text', content: '' }] };
  }

  const blocks: AIBlock[] = [];
  const lower = text.toLowerCase();

  // 1. Check for Properties
  const properties = extractProperties(text);
  if (properties.length > 0) {
    const isSingleIntent =
      properties.length === 1 ||
      lower.includes('cheapest') ||
      lower.includes('most affordable') ||
      lower.includes('lowest price') ||
      lower.includes('most expensive') ||
      lower.includes('highest price') ||
      lower.includes('tell me about this property');

    if (isSingleIntent && properties.length >= 1) {
      const p = properties[0];
      const isCheapest = lower.includes('cheap') || lower.includes('affordable') || lower.includes('lowest');
      const isMostExpensive = lower.includes('expensive') || lower.includes('luxury') || lower.includes('highest');

      let highlightTitle = 'Featured Property';
      if (isCheapest) {
        highlightTitle = 'Cheapest Property';
        p.isCheapest = true;
      } else if (isMostExpensive) {
        highlightTitle = 'Most Exclusive Property';
        p.isMostExpensive = true;
      }

      // Extract brief intro before the property
      const introMatch = text.match(/^([^[]+?)(?:\[|\n\n)/);
      const intro = introMatch ? cleanRawMarkdown(introMatch[1]) : undefined;

      blocks.push({
        type: 'single_property',
        property: p,
        highlightTitle,
      });

      return {
        introText: intro,
        blocks,
      };
    } else {
      // Multiple properties (search results)
      // Extract intro text (e.g. "Here are the top properties matching your request:")
      const introMatch = text.match(/^([^|[\n]+(?::|\.|\!))\s*(?:\n|\||1\.)/);
      let intro = introMatch ? cleanRawMarkdown(introMatch[1]) : 'Here are top matching properties from our live database:';

      blocks.push({
        type: 'property_list',
        properties,
      });

      return {
        introText: intro,
        blocks,
      };
    }
  }

  // 2. Check for Agents Table
  const agents = extractAgents(text);
  if (agents.length > 0) {
    const introMatch = text.match(/^([^|\n]+)/);
    const intro = introMatch ? cleanRawMarkdown(introMatch[1]) : 'Verified platform Agents & Agencies:';

    blocks.push({
      type: 'agent_list',
      agents,
    });

    return {
      introText: intro,
      blocks,
      outroText: 'You can contact any agent directly by phone, email, or by scheduling an inspection on the listing page.',
    };
  }

  // 3. Check for Mortgage Calculations
  const mortgage = extractMortgage(text);
  if (mortgage) {
    blocks.push({
      type: 'mortgage_summary',
      mortgage,
    });
    return {
      blocks,
    };
  }

  // 4. Check for Suburb Insights
  const suburbInsight = extractSuburbInsight(text);
  if (suburbInsight && (suburbInsight.averagePrice || suburbInsight.listingsCount || suburbInsight.recentSales)) {
    blocks.push({
      type: 'suburb_insight',
      insight: suburbInsight,
    });
    return {
      blocks,
    };
  }

  // 5. Check for Step-by-Step Guide
  const steps = extractStepGuide(text);
  if (steps.length > 1) {
    const introMatch = text.match(/^([^\d\n]+(?::|\.|\!))\s*\n/);
    const intro = introMatch ? cleanRawMarkdown(introMatch[1]) : 'Simple steps to buy a property on AuraEstates:';

    blocks.push({
      type: 'step_guide',
      steps,
    });

    return {
      introText: intro,
      blocks,
    };
  }

  // 6. Check for Market Stats
  const marketStats = extractMarketStats(text);
  if (marketStats) {
    const introMatch = text.match(/^([^—\n]+)/);
    const intro = introMatch ? cleanRawMarkdown(introMatch[1]) : 'AuraEstates Live Marketplace Overview:';

    blocks.push({
      type: 'market_stats',
      stats: marketStats,
      explanation: 'Use the filters on the Explore page to browse all live listings.',
    });

    return {
      introText: intro,
      blocks,
    };
  }

  // 7. General / Conversational Fallback
  blocks.push({
    type: 'formatted_text',
    content: text,
  });

  return {
    blocks,
  };
}
