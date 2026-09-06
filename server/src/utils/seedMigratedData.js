const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Suburb = require('../models/Suburb');
const Property = require('../models/Property');
const Blog = require('../models/Blog');
const User = require('../models/User');
const Agency = require('../models/Agency');

const SUBURBS_DATA = [
  {
    name: 'Point Piper',
    state: 'NSW',
    medianPrice: '$18.5M',
    medianHouse: 18500000,
    medianUnit: 4200000,
    clearanceRate: 82,
    daysOnMarket: 41,
    growth: 12.4,
    trend: 'up',
    description: "Point Piper is one of Sydney's most prestigious harbourside suburbs, consistently ranking among Australia's most expensive postcodes. Offering direct deep-water harbour access and panoramic Sydney Harbour Bridge views.",
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=600',
    nearbySchools: [
      { name: 'Ascham School', type: 'Private Girls', rating: '4.8', distance: '0.8 km' },
      { name: 'Cranbrook School', type: 'Private Boys', rating: '4.7', distance: '1.2 km' },
      { name: 'Sydney Grammar School', type: 'Private Co-ed', rating: '4.9', distance: '1.6 km' }
    ]
  },
  {
    name: 'Barangaroo',
    state: 'NSW',
    medianPrice: '$2.85M',
    medianHouse: null,
    medianUnit: 2850000,
    clearanceRate: 78,
    daysOnMarket: 33,
    growth: 9.1,
    trend: 'up',
    description: "Barangaroo is a world-class urban renewal precinct on Sydney Harbour's western edge, boasting high-rise architectural sky penthouses and Michelin-level waterfront dining.",
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
    nearbySchools: [
      { name: 'Fort Street Public School', type: 'Public Primary', rating: '4.7', distance: '0.5 km' },
      { name: 'St Andrew\'s Cathedral School', type: 'Private Co-ed', rating: '4.8', distance: '1.1 km' }
    ]
  },
  {
    name: 'Bondi Beach',
    state: 'NSW',
    medianPrice: '$4.8M',
    medianHouse: 4800000,
    medianUnit: 1650000,
    clearanceRate: 74,
    daysOnMarket: 38,
    growth: 7.2,
    trend: 'up',
    description: "Bondi Beach is one of Australia's most iconic coastal suburbs, famous for golden surf, lively lifestyle cafés, and prestigious beachfront apartments.",
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    nearbySchools: [
      { name: 'Bondi Beach Public School', type: 'Public Primary', rating: '4.6', distance: '0.4 km' },
      { name: 'Reddam House', type: 'Private Co-ed', rating: '4.9', distance: '1.4 km' }
    ]
  },
  {
    name: 'Mosman',
    state: 'NSW',
    medianPrice: '$5.2M',
    medianHouse: 5200000,
    medianUnit: 1350000,
    clearanceRate: 76,
    daysOnMarket: 44,
    growth: 6.8,
    trend: 'up',
    description: "Mosman is an affluent Lower North Shore enclave renowned for historic Federation mansions, prestigious private academies, and tranquil harbour views.",
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
    nearbySchools: [
      { name: 'Queenwood School for Girls', type: 'Private Girls', rating: '4.9', distance: '0.9 km' },
      { name: 'Mosman High School', type: 'Public Secondary', rating: '4.6', distance: '1.0 km' }
    ]
  },
  {
    name: 'Toorak',
    state: 'VIC',
    medianPrice: '$5.9M',
    medianHouse: 5900000,
    medianUnit: 1200000,
    clearanceRate: 73,
    daysOnMarket: 52,
    growth: 4.2,
    trend: 'up',
    description: "Toorak is Melbourne's most exclusive luxury suburb, featuring grand Victorian estates, tree-lined boulevards, and Australia's highest density of private wealth.",
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
    nearbySchools: [
      { name: 'St Kevin\'s College', type: 'Private Boys', rating: '4.9', distance: '1.1 km' },
      { name: 'Loreto Mandeville Hall', type: 'Private Girls', rating: '4.8', distance: '1.3 km' },
      { name: 'Geelong Grammar Glamorgan', type: 'Private Co-ed', rating: '4.9', distance: '0.7 km' }
    ]
  },
  {
    name: 'Noosa Heads',
    state: 'QLD',
    medianPrice: '$3.2M',
    medianHouse: 3200000,
    medianUnit: 1100000,
    clearanceRate: 68,
    daysOnMarket: 47,
    growth: 8.6,
    trend: 'up',
    description: "Noosa Heads offers ultra-luxury coastal living along the Sunshine Coast, renowned for Hastings Street boutiques and pristine national park headlands.",
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=600',
    nearbySchools: [
      { name: 'St Teresa\'s Catholic College', type: 'Private Co-ed', rating: '4.7', distance: '2.5 km' },
      { name: 'Sunshine Beach State High', type: 'Public Secondary', rating: '4.5', distance: '3.1 km' }
    ]
  },
  {
    name: 'South Yarra',
    state: 'VIC',
    medianPrice: '$3.4M',
    medianHouse: 3400000,
    medianUnit: 680000,
    clearanceRate: 72,
    daysOnMarket: 36,
    growth: 5.5,
    trend: 'up',
    description: "South Yarra is an inner-city cultural epicentre famed for Chapel Street shopping, historic Royal Botanic Gardens, and high-end modern apartments.",
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600',
    nearbySchools: [
      { name: 'Melbourne Girls Grammar', type: 'Private Girls', rating: '4.9', distance: '0.8 km' },
      { name: 'South Yarra Primary School', type: 'Public Primary', rating: '4.6', distance: '0.5 km' }
    ]
  },
  {
    name: 'default',
    state: 'NSW',
    medianPrice: '$1.8M',
    medianHouse: 1800000,
    medianUnit: 720000,
    clearanceRate: 65,
    daysOnMarket: 42,
    growth: 5.1,
    trend: 'up',
    description: 'A sought-after Australian suburb offering a compelling mix of lifestyle, investment potential, and community character.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600',
    nearbySchools: [
      { name: 'Local Public School', type: 'Public Primary', rating: '4.8', distance: '0.8 km' },
      { name: 'High School Academy', type: 'Public Secondary', rating: '4.5', distance: '1.2 km' },
      { name: 'Grammar College', type: 'Private Co-ed', rating: '4.9', distance: '1.6 km' }
    ]
  }
];

const SOLD_PROPERTIES_DATA = [
  {
    title: 'Grand Harbourfront Villa',
    description: 'Ultra-prestigious deep-water harbourfront estate sold with private jetty, 6-car showroom garage, cinema, and heated infinity pool.',
    propertyType: 'Villa',
    listingType: 'Sale',
    price: 22400000,
    priceGuide: 'Sold for $22,400,000',
    address: {
      street: '14 Wolseley Road',
      suburb: 'Point Piper',
      city: 'Sydney',
      state: 'NSW',
      postcode: '2027',
      country: 'Australia'
    },
    location: { type: 'Point', coordinates: [151.2492, -33.8647] },
    bedrooms: 6,
    bathrooms: 7,
    parkingSpaces: 6,
    landArea: 1200,
    floorArea: 950,
    yearBuilt: 2023,
    status: 'Sold',
    tier: 'Premium',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    ]
  },
  {
    title: 'Bondi Beachfront Penthouse',
    description: 'Iconic panoramic beachfront sky penthouse sold overlooking golden sands of Bondi Beach, with custom Carrara marble entertaining terraces.',
    propertyType: 'Apartment',
    listingType: 'Sale',
    price: 4850000,
    priceGuide: 'Sold for $4,850,000',
    address: {
      street: '120 Campbell Parade',
      suburb: 'Bondi Beach',
      city: 'Sydney',
      state: 'NSW',
      postcode: '2026',
      country: 'Australia'
    },
    location: { type: 'Point', coordinates: [151.2743, -33.8915] },
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    landArea: 0,
    floorArea: 220,
    yearBuilt: 2022,
    status: 'Sold',
    tier: 'Featured',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200'
    ]
  },
  {
    title: 'Toorak European Villa',
    description: 'Stately French provincial manor with heated indoor lap pool, landscaped private gardens, wine cellar, and executive study.',
    propertyType: 'Villa',
    listingType: 'Sale',
    price: 16500000,
    priceGuide: 'Sold for $16,500,000',
    address: {
      street: '12 St Georges Road',
      suburb: 'Toorak',
      city: 'Melbourne',
      state: 'VIC',
      postcode: '3142',
      country: 'Australia'
    },
    location: { type: 'Point', coordinates: [145.0112, -37.8415] },
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 5,
    landArea: 1400,
    floorArea: 880,
    yearBuilt: 2021,
    status: 'Sold',
    tier: 'Premium',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    ]
  },
  {
    title: 'Brighton Esplanade Beachside',
    description: 'Modernist coastal triumph commanding unobstructed Port Phillip Bay views, private lift, rooftop deck, and basement car lift.',
    propertyType: 'Villa',
    listingType: 'Sale',
    price: 9400000,
    priceGuide: 'Sold for $9,400,000',
    address: {
      street: '64 Esplanade',
      suburb: 'Brighton',
      city: 'Melbourne',
      state: 'VIC',
      postcode: '3186',
      country: 'Australia'
    },
    location: { type: 'Point', coordinates: [144.9856, -37.9152] },
    bedrooms: 5,
    bathrooms: 4,
    parkingSpaces: 4,
    landArea: 890,
    floorArea: 620,
    yearBuilt: 2024,
    status: 'Sold',
    tier: 'Premium',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200'
    ]
  }
];

const BLOGS_DATA = [
  {
    title: 'Australian Property Market Outlook 2026: Trends & Growth Suburbs',
    slug: 'australian-property-market-outlook-2026',
    excerpt: 'An in-depth analysis of interest rate trajectory, suburb price performance, and key demographic shifts shaping 2026 luxury real estate.',
    content: 'The Australian housing market has shown resilient performance entering 2026 with strong demand driven by low inventory levels and high international migration. Prime waterfront precincts across Sydney, Melbourne, and South-East Queensland continue to lead price appreciation. Capital growth has accelerated in coastal corridors as high-net-worth buyers prioritize lifestyle amenities, eco-efficiency, and smart home technology.',
    category: 'Market Insights',
    author: 'Chief Economist Editorial',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
    readTime: '5 min read'
  },
  {
    title: 'Top 5 Renovation Projects That Boost Property Valuation',
    slug: 'top-5-renovation-projects-that-boost-property-valuation',
    excerpt: 'Discover which high-end home upgrades yield the highest ROI when preparing your premium residential listing for auction.',
    content: 'When preparing to sell a luxury residence, strategic renovations dramatically increase buyer competition and push auction bids higher. Open-plan kitchen modernizations with stone waterfall islands, architectural landscape lighting, smart home automation, and energy-efficient solar plus storage systems lead the market in return on investment.',
    category: 'Sellers Guide',
    author: 'Prestige Design Advisory',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    readTime: '4 min read'
  },
  {
    title: 'Architecture Feature: Biophilic Waterfront Design in Mosman',
    slug: 'architecture-feature-biophilic-waterfront-design-in-mosman',
    excerpt: 'How Australian architects are blending native stone, natural ventilation, and panoramic harbour glass pavilions.',
    content: 'Biophilic architecture is transforming Sydney Lower North Shore residences. Integrating living green walls, floor-to-ceiling double-glazed thermal walls, and natural sandstone extracted directly on-site harmonizes contemporary structural luxury with the rugged beauty of Sydney Harbour headlands.',
    category: 'Architecture & Design',
    author: 'Architectural Digest Feature',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
    readTime: '6 min read'
  },
  {
    title: 'Prestige Investment Strategy: Yield vs Capital Growth in 2026',
    slug: 'prestige-investment-strategy-yield-vs-capital-growth',
    excerpt: 'Smart portfolio allocation balancing blue-chip capital appreciation with high-performing executive rental yields.',
    content: 'Successful property wealth creation requires balancing blue-chip capital growth with executive cash-flow yields. While central Sydney and Toorak historically outperform on long-term capital compounding, regional luxury coastal markets now deliver sustained 4.5% to 5.5% gross yields under high executive demand.',
    category: 'Investment Analysis',
    author: 'Wealth Advisory Research',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
    readTime: '7 min read'
  },
  {
    title: 'Navigating Property Tax Changes & Foreign Buyer Regulations',
    slug: 'navigating-property-tax-changes-and-foreign-buyer-regulations',
    excerpt: 'Essential updates on stamp duty concessions, land tax thresholds, and compliance for domestic and overseas investors.',
    content: 'Navigating real estate taxation requires staying updated with federal and state regulatory amendments. Recent changes to land tax brackets and foreign investment review board guidelines impact high-value acquisitions. Consulting with experienced property conveyancers and wealth advisors ensures structured asset protection.',
    category: 'Legal & Tax',
    author: 'Aura Advisory Legal Counsel',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    readTime: '5 min read'
  },
  {
    title: 'Suburb Spotlight: Point Piper & Barangaroo Market Dynamics',
    slug: 'suburb-spotlight-point-piper-and-barangaroo-market-dynamics',
    excerpt: 'Why Sydney Harbour precincts are setting record-breaking median price benchmarks in 2026.',
    content: 'Harbourside precincts like Point Piper and Barangaroo continue to break national price records. Driven by limited supply, private deep-water berths, and unhindered Opera House views, buyer demand remains exceptionally competitive. Exclusive off-market transactions account for over 40% of luxury transactions.',
    category: 'Luxury Suburbs',
    author: 'Prestige Realty Analysts',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1200',
    readTime: '4 min read'
  }
];

const AGENTS_DATA = [
  {
    name: 'Ishika Bhatia',
    email: 'ishikabhatia51@gmail.com',
    password: 'password123',
    role: 'agent',
    phone: '+61 422 100 001',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    bio: "Passionate real estate agent with a keen eye for premium properties. Dedicated to making every client's property journey smooth and rewarding.",
    licenseNumber: 'NSW-AG-10021',
    specialties: ['Luxury Homes', 'Apartments', 'Investments'],
    rating: 4.9,
    dealsCount: 64,
    isActive: true,
    isVerified: true
  },
  {
    name: 'Upansh Verma',
    email: 'upansh769@gmail.com',
    password: 'password123',
    role: 'agent',
    phone: '+61 411 200 002',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    bio: 'Results-driven agent specialising in first-home buyers and suburban growth corridors. Trusted advisor with a transparent, client-first approach.',
    licenseNumber: 'ACT-AG-20025',
    specialties: ['First Home Buyers', 'Suburbs', 'Land'],
    rating: 4.7,
    dealsCount: 48,
    isActive: true,
    isVerified: true
  },
  {
    name: 'Reet Kapoor',
    email: 'reet67711@gmail.com',
    password: 'password123',
    role: 'agent',
    phone: '+61 433 300 003',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    bio: 'Melbourne specialist with expertise in off-the-plan developments and inner-city investments. Helping clients build wealth through smart property choices.',
    licenseNumber: 'VIC-AG-30036',
    specialties: ['Off-the-Plan', 'Inner-City', 'Investments'],
    rating: 4.8,
    dealsCount: 39,
    isActive: true,
    isVerified: true
  },
  {
    name: 'Ruhi Bhatia',
    email: 'ruhibhatia0022@gmail.com',
    password: 'password123',
    role: 'agent',
    phone: '+61 445 678 901',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    bio: 'Senior prestige advisor specializing in luxury waterfront penthouses and high-net-worth acquisitions across Sydney Harbour.',
    licenseNumber: 'NSW-AG-10088',
    specialties: ['Waterfront Estates', 'Penthouses', 'Auctions'],
    rating: 5.0,
    dealsCount: 72,
    isActive: true,
    isVerified: true
  }
];

const seedMigratedData = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in server/.env');
  }

  console.log('Connecting to MongoDB Atlas at:', mongoUri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+(@.*)/, '$1****$2'));
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB Atlas successfully.');

  // 1. Seed Suburbs
  for (const s of SUBURBS_DATA) {
    await Suburb.findOneAndUpdate(
      { name: s.name },
      { $set: s },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${SUBURBS_DATA.length} Suburb profiles into MongoDB.`);

  // 2. Seed Sold Properties
  for (const p of SOLD_PROPERTIES_DATA) {
    await Property.findOneAndUpdate(
      { title: p.title, status: 'Sold' },
      { $set: p },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${SOLD_PROPERTIES_DATA.length} Sold Properties into MongoDB.`);

  // 3. Seed Blogs
  for (const b of BLOGS_DATA) {
    await Blog.findOneAndUpdate(
      { slug: b.slug },
      { $set: b },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${BLOGS_DATA.length} Curated Blog articles into MongoDB.`);

  // 4. Seed Agents
  let agency = await Agency.findOne();
  for (const a of AGENTS_DATA) {
    const existing = await User.findOne({ email: a.email });
    if (!existing) {
      await User.create({
        ...a,
        agencyId: agency ? agency._id : null
      });
    } else {
      await User.findByIdAndUpdate(existing._id, {
        $set: {
          role: 'agent',
          phone: a.phone,
          avatar: a.avatar,
          bio: a.bio,
          licenseNumber: a.licenseNumber,
          specialties: a.specialties,
          rating: a.rating,
          dealsCount: a.dealsCount,
          isActive: true,
          isVerified: true,
          agencyId: agency ? agency._id : existing.agencyId
        }
      });
    }
  }
  console.log(`✅ Seeded / Verified ${AGENTS_DATA.length} Licensed Agent profiles into MongoDB.`);

  console.log('\n🎉 ALL STATIC DUMMY DATA HAS BEEN PERMANENTLY MIGRATED TO MONGODB ATLAS!');
};

if (require.main === module) {
  seedMigratedData()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration error:', err);
      process.exit(1);
    });
}

module.exports = seedMigratedData;
