const mongoose = require('mongoose');

const suburbSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Suburb name is required'],
      unique: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    medianPrice: {
      type: String,
      default: 'N/A'
    },
    medianHouse: {
      type: Number,
      default: null
    },
    medianUnit: {
      type: Number,
      default: null
    },
    clearanceRate: {
      type: Number,
      default: 70
    },
    daysOnMarket: {
      type: Number,
      default: 40
    },
    growth: {
      type: Number,
      default: 5.0
    },
    trend: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'up'
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=600'
    },
    nearbySchools: [
      {
        name: { type: String },
        type: { type: String },
        rating: { type: String },
        distance: { type: String }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Suburb', suburbSchema);
