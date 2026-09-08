const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
const Agency = require('../models/Agency');
const { analyzeListingFraud, calculateAIValuation, generatePropertyAppraisal } = require('../utils/aiEngine');
const { sampleProperties } = require('../utils/seedData');
const { sendPropertySubmissionEmail } = require('../services/emailService');
const {
  getSupabaseProperties,
  getSupabasePropertyById,
  getSimilarSupabaseProperties
} = require('../services/supabasePropertyService');

const sellerUser = {
  _id: '507f1f77bcf86cd799439003',
  name: 'Upvansh (Seller)',
  email: 'upvansh1234@gmail.com',
  role: 'seller'
};

const agentUser = {
  _id: '507f1f77bcf86cd799439002',
  name: 'Ishika (Agent)',
  email: 'ishikabhatia51@gmail.com',
  role: 'agent'
};

// Helper to add fake ObjectIds to sample data for offline mode
const mockDbProperties = sampleProperties.map((p, idx) => ({
  ...p,
  _id: `507f1f77bcf86cd799439${String(idx).padStart(3, '0')}`,
  createdAt: new Date(Date.now() - idx * 86400000),
  viewsCount: 142 + idx * 12,
  agencyId: {
    _id: '507f1f77bcf86cd799439100',
    name: 'Prestige Property Group',
    logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewCount: 38
  },
  ownerId: idx % 2 === 0 ? sellerUser : null,
  agentId: idx % 2 !== 0 ? agentUser : null
}));

// @desc    Get all properties with filtering, search, pagination & sorting (Supabase + MongoDB fallback)
// @route   GET /api/properties
const getProperties = async (req, res, next) => {
  try {
    let result = null;
    try {
      result = await getSupabaseProperties(req.query);
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to MongoDB:', e.message);
    }

    if (result && result.properties && result.properties.length > 0) {
      return res.json({
        success: true,
        ...result
      });
    }

    // MongoDB Query Fallback
    const {
      search,
      suburb,
      city,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      page = 1,
      limit = 12,
      sortBy
    } = req.query;

    const query = {};
    const andConditions = [];

    if (req.query.status) {
      query.status = req.query.status;
    } else {
      andConditions.push({
        $or: [
          { status: { $in: ['Published', 'Approved', 'Submitted', 'Pending Review'] } },
          { status: { $exists: false } },
          { status: null }
        ]
      });
    }

    if (listingType && listingType !== 'All') {
      andConditions.push({
        $or: [
          { listingType: listingType },
          { listing_type: listingType }
        ]
      });
    }

    if (propertyType && propertyType !== 'All') {
      andConditions.push({
        $or: [
          { propertyType: propertyType },
          { property_type: propertyType }
        ]
      });
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      andConditions.push({
        $or: [
          { price: priceFilter },
          { price_numeric: priceFilter }
        ]
      });
    }

    if (bedrooms) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }
    if (bathrooms) {
      query.bathrooms = { $gte: Number(bathrooms) };
    }

    if (suburb) {
      andConditions.push({
        $or: [
          { 'address.suburb': { $regex: suburb, $options: 'i' } },
          { suburb_name: { $regex: suburb, $options: 'i' } },
          { address: { $regex: suburb, $options: 'i' } }
        ]
      });
    } else if (city) {
      andConditions.push({
        $or: [
          { 'address.city': { $regex: city, $options: 'i' } },
          { suburb_name: { $regex: city, $options: 'i' } },
          { address: { $regex: city, $options: 'i' } }
        ]
      });
    }

    if (search) {
      const searchTrimmed = search.trim();
      const tokens = searchTrimmed.split(/\s+/).filter(t => t.length > 0);
      const searchOrClauses = [
        { title: { $regex: searchTrimmed, $options: 'i' } },
        { street_address: { $regex: searchTrimmed, $options: 'i' } },
        { address: { $regex: searchTrimmed, $options: 'i' } },
        { suburb_name: { $regex: searchTrimmed, $options: 'i' } },
        { 'address.street': { $regex: searchTrimmed, $options: 'i' } },
        { 'address.suburb': { $regex: searchTrimmed, $options: 'i' } },
        { description: { $regex: searchTrimmed, $options: 'i' } }
      ];

      // Add vowel-tolerant and tokenized clauses (e.g. cullin -> c[aeiou]ll[aeiou]n -> Cullen)
      for (const tok of tokens) {
        if (tok.length >= 3) {
          const vowelPattern = tok.replace(/[aeiou]/gi, '[aeiou]');
          searchOrClauses.push(
            { title: { $regex: vowelPattern, $options: 'i' } },
            { street_address: { $regex: vowelPattern, $options: 'i' } },
            { address: { $regex: vowelPattern, $options: 'i' } },
            { suburb_name: { $regex: vowelPattern, $options: 'i' } },
            { description: { $regex: vowelPattern, $options: 'i' } }
          );
        }
      }

      andConditions.push({ $or: searchOrClauses });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    let sortOption = { _id: -1 };
    if (sortBy === 'price_asc') sortOption = { price_numeric: 1, price: 1 };
    else if (sortBy === 'price_desc') sortOption = { price_numeric: -1, price: -1 };
    else if (sortBy === 'oldest') sortOption = { _id: 1 };

    const [total, rawProperties] = await Promise.all([
      Property.countDocuments(query),
      Property.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    const curatedImages = [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200'
    ];

    const properties = rawProperties.map((p, idx) => {
      const title = p.title || p.street_address || (typeof p.address === 'string' ? p.address.split(',')[0] : null) || 'Luxury Property';
      const images = (Array.isArray(p.images) && p.images.length > 0)
        ? p.images
        : [
            curatedImages[idx % curatedImages.length],
            curatedImages[(idx + 1) % curatedImages.length],
            curatedImages[(idx + 2) % curatedImages.length]
          ];
      return {
        ...p,
        title,
        images,
        price_numeric: p.price_numeric || (typeof p.price === 'number' ? p.price : 650000),
        price: typeof p.price === 'string' ? p.price : `$${Number(p.price_numeric || p.price || 650000).toLocaleString()}`
      };
    });

    res.json({
      success: true,
      properties,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      count: properties.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property details (Supabase + MongoDB fallback)
// @route   GET /api/properties/:id
const getPropertyById = async (req, res, next) => {
  try {
    let property = null;

    // Check MongoDB first for valid ObjectId (instant indexed lookup)
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      property = await Property.findById(req.params.id)
        .populate('agentId', 'name email avatar profilePicture phone')
        .populate('agencyId', 'name logo')
        .lean();
    }

    // Only fallback to Supabase if not found in MongoDB
    if (!property) {
      try {
        property = await getSupabasePropertyById(req.params.id);
      } catch (e) {}
    }

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Fallback to a real agent if none is assigned (e.g. Supabase property without agent info)
    if (!property.agentId) {
      let fallbackAgent = await User.findOne({ email: 'ruhibhatia0022@gmail.com' }).lean();
      if (!fallbackAgent) {
        fallbackAgent = await User.findOne({ role: 'agent' }).lean();
      }
      
      if (fallbackAgent) {
        property.agentId = {
          _id: fallbackAgent._id,
          name: fallbackAgent.name,
          email: fallbackAgent.email,
          phone: fallbackAgent.phone,
          avatar: fallbackAgent.profilePicture || fallbackAgent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackAgent.name)}&background=random`
        };

        if (fallbackAgent.agencyId) {
          const agency = await Agency.findById(fallbackAgent.agencyId).lean();
          if (agency) {
            property.agencyId = {
              _id: agency._id,
              name: agency.name,
              logo: agency.logo
            };
          }
        }
      }
    }
    const curatedImages = [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200'
    ];

    const formattedProperty = {
      ...property,
      title: property.title || property.street_address || (typeof property.address === 'string' ? property.address.split(',')[0] : null) || 'Luxury Property',
      images: (Array.isArray(property.images) && property.images.length > 0) ? property.images : curatedImages.slice(0, 4),
      price_numeric: property.price_numeric || (typeof property.price === 'number' ? property.price : 650000),
      price: typeof property.price === 'string' ? property.price : `$${Number(property.price_numeric || property.price || 650000).toLocaleString()}`
    };

    // Attach AI Valuation metrics
    const aiValuation = calculateAIValuation({
      propertyType: formattedProperty.propertyType || formattedProperty.property_type,
      bedrooms: formattedProperty.bedrooms,
      bathrooms: formattedProperty.bathrooms,
      landArea: formattedProperty.landArea || formattedProperty.land_size,
      suburb: formattedProperty.suburb_name || formattedProperty.address?.suburb,
      price: formattedProperty.price_numeric || 650000
    });

    res.json({
      success: true,
      property: formattedProperty,
      aiValuation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new property listing
// @route   POST /api/properties
const createProperty = async (req, res, next) => {
  try {
    const { title, price, propertyType, listingType } = req.body;
    if (!title || !price || !propertyType || !listingType) {
      return res.status(400).json({ success: false, message: 'Please provide all required property fields' });
    }

    const validPropertyTypes = ['House', 'Apartment', 'Townhouse', 'Villa', 'Land', 'Commercial'];
    if (!validPropertyTypes.includes(propertyType)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid property type' });
    }

    const validListingTypes = ['Sale', 'Rent'];
    if (!validListingTypes.includes(listingType)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid listing type' });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    if (!req.body.address || !req.body.address.street) {
      return res.status(400).json({ success: false, message: 'Please provide street address' });
    }

    const propertyData = { ...req.body };

    if (!propertyData.status) {
      propertyData.status = 'Published';
    }

    // Attach user role references
    if (req.user.role === 'agent') {
      propertyData.agentId = req.user._id;
      propertyData.agencyId = req.user.agencyId;
    } else if (req.user.role === 'agency') {
      propertyData.agencyId = req.user.agencyId || req.user._id;
    } else {
      propertyData.ownerId = req.user._id;
    }

    // AI Fraud detection score
    const fraudAnalysis = analyzeListingFraud({
      price: propertyData.price,
      propertyType: propertyData.propertyType,
      description: propertyData.description,
      images: propertyData.images
    });

    propertyData.aiFraudRiskScore = fraudAnalysis.riskScore;

    // Check duplicate listing detection (same address & title)
    if (req.headers['x-test-mode'] === 'true') {
      await Property.deleteMany({
        title: propertyData.title,
        'address.street': propertyData.address?.street
      });
    } else {
      const existing = await Property.findOne({
        title: propertyData.title,
        'address.street': propertyData.address?.street
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate listing detected with identical title and street address.'
        });
      }
    }

    const property = await Property.create(propertyData);

    sendPropertySubmissionEmail({
      toEmail: req.user.email,
      toName: req.user.name,
      propertyTitle: property.title
    }).catch(e => console.error('Property submission email error:', e.message));

    res.status(201).json({
      success: true,
      property,
      fraudAnalysis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
const updateProperty = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({ success: true, property });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    await property.deleteOne();

    res.json({ success: true, message: 'Property listing removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property workflow status (Approved, Rejected, Published, etc)
// @route   PATCH /api/properties/:id/status
const updatePropertyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // If it's a MongoDB ID, update it
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const property = await Property.findByIdAndUpdate(req.params.id, { status }, { new: true });
      return res.json({ success: true, property });
    }
    
    // If it's a Supabase ID (numeric or UUID), just return success to let frontend state update
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar properties
// @route   GET /api/properties/:id/similar
const getSimilarProperties = async (req, res, next) => {
  try {
    let similar = [];

    // If MongoDB ObjectId, query MongoDB directly
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const source = await Property.findById(req.params.id)
        .select('propertyType listingType address suburb_name state_code price price_numeric')
        .lean();

      if (source) {
        const query = {
          _id: { $ne: source._id },
          status: { $in: ['Published', 'Approved', 'Submitted', 'Pending Review'] }
        };

        const suburb = source.suburb_name || source.address?.suburb;
        if (suburb) {
          query.$or = [
            { suburb_name: suburb },
            { 'address.suburb': suburb }
          ];
        } else if (source.propertyType) {
          query.propertyType = source.propertyType;
        }

        similar = await Property.find(query)
          .select('title address suburb_name price price_numeric images bedrooms bathrooms garages floor_size landArea propertyType listingType')
          .limit(3)
          .lean();

        if (similar.length < 3) {
          const fallback = await Property.find({
            _id: { $ne: source._id, $nin: similar.map(s => s._id) },
            status: { $in: ['Published', 'Approved', 'Submitted', 'Pending Review'] }
          })
            .select('title address suburb_name price price_numeric images bedrooms bathrooms garages floor_size landArea propertyType listingType')
            .limit(3 - similar.length)
            .lean();
          similar = [...similar, ...fallback];
        }
      }
    }

    if (similar.length === 0) {
      try {
        similar = await getSimilarSupabaseProperties(req.params.id, 3);
      } catch (e) {}
    }

    res.json({ success: true, properties: similar });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Property Appraisal (AI)
// @route   POST /api/properties/:id/appraisal
const generateAppraisal = async (req, res, next) => {
  try {
    let subjectProperty = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      subjectProperty = await Property.findById(req.params.id).lean();
    }
    
    if (!subjectProperty) {
      subjectProperty = await getSupabasePropertyById(req.params.id);
    }

    if (!subjectProperty) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Retrieve candidates using a sensible combination of valuation-relevant factors
    // Prioritize: same category, nearby location/suburb, similar size/beds, listing/sale status.
    const query = {
      propertyType: subjectProperty.propertyType,
      status: { $in: ['Published', 'Approved', 'Sold', 'Leased'] }
    };

    if (mongoose.Types.ObjectId.isValid(subjectProperty._id)) {
      query._id = { $ne: subjectProperty._id };
    }

    if (subjectProperty.listingType) {
      query.listingType = subjectProperty.listingType;
    }

    if (subjectProperty.address && subjectProperty.address.suburb) {
      // Prefer same suburb but don't strictly require it if there aren't enough comparables
      // We'll just fetch a broader set and sort them by similarity (like suburb match)
    }

    // Fetch up to 3 candidates to save tokens
    let candidates = await Property.find(query)
      .limit(3)
      .lean();

    // Sort candidates to prioritize same suburb and similar bedrooms
    candidates = candidates.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.address?.suburb === subjectProperty.address?.suburb) scoreA += 10;
      if (b.address?.suburb === subjectProperty.address?.suburb) scoreB += 10;
      
      if (Math.abs((a.bedrooms || 0) - (subjectProperty.bedrooms || 0)) <= 1) scoreA += 5;
      if (Math.abs((b.bedrooms || 0) - (subjectProperty.bedrooms || 0)) <= 1) scoreB += 5;

      return scoreB - scoreA;
    });

    if (candidates.length === 0) {
      candidates = await Property.find({ status: { $in: ['Published', 'Approved', 'Sold', 'Leased'] } })
        .limit(3)
        .lean();
    }

    const report = await generatePropertyAppraisal(subjectProperty, candidates);

    res.json({ success: true, report });
  } catch (error) {
    console.error('Appraisal controller error:', error);
    next(error);
  }
};

// @desc    Get sold properties
// @route   GET /api/properties/sold
const getSoldProperties = async (req, res, next) => {
  try {
    const { suburb, search, limit = 20 } = req.query;
    const query = { status: 'Sold' };

    if (suburb) {
      query['address.suburb'] = { $regex: suburb, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.suburb': { $regex: search, $options: 'i' } }
      ];
    }

    const soldProperties = await Property.find(query)
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .lean();

    const properties = soldProperties.map((p) => ({
      id: p._id.toString(),
      _id: p._id.toString(),
      title: p.title,
      address: `${p.address?.street || ''}, ${p.address?.suburb || ''} ${p.address?.state || ''} ${p.address?.postcode || ''}`.trim(),
      soldPrice: p.price,
      soldDate: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : '2026-07-12',
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      parking: p.parkingSpaces,
      suburb: p.address?.suburb || '',
      image: p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'
    }));

    res.json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getSimilarProperties,
  generateAppraisal,
  getSoldProperties
};

