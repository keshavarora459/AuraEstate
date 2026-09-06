const Suburb = require('../models/Suburb');

// @desc    Get all suburbs
// @route   GET /api/suburbs
const getSuburbs = async (req, res, next) => {
  try {
    const suburbs = await Suburb.find().sort({ growth: -1 }).lean();
    res.json({
      success: true,
      count: suburbs.length,
      suburbs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single suburb by name
// @route   GET /api/suburbs/:name
const getSuburbByName = async (req, res, next) => {
  try {
    const rawName = decodeURIComponent(req.params.name).trim();
    let suburb = await Suburb.findOne({ name: { $regex: new RegExp(`^${rawName}$`, 'i') } }).lean();

    if (!suburb) {
      // Fallback to default if not found
      suburb = await Suburb.findOne({ name: 'default' }).lean();
    }

    if (!suburb) {
      return res.status(404).json({ success: false, message: 'Suburb profile not found' });
    }

    res.json({
      success: true,
      suburb
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuburbs,
  getSuburbByName
};
