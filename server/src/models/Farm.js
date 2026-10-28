import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
      maxlength: 120
    },
    location: {
      state: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      village: { type: String, trim: true, default: '' },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [0.01, 'Area must be positive']
    },
    areaUnit: {
      type: String,
      enum: ['acre', 'hectare'],
      default: 'acre'
    },
    soilType: {
      type: String,
      trim: true,
      default: 'Loamy'
    },
    irrigationMethod: {
      type: String,
      trim: true,
      default: 'Drip'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

farmSchema.index({ 'location.state': 1, 'location.district': 1 });

export const Farm = mongoose.model('Farm', farmSchema);
