import mongoose from 'mongoose';

const soilRecordSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      default: null
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    measurements: {
      ph: { type: Number, min: 0, max: 14, required: true },
      nitrogen: { type: Number, min: 0, required: true }, // mg/kg or kg/ha
      phosphorus: { type: Number, min: 0, required: true },
      potassium: { type: Number, min: 0, required: true },
      moisture: { type: Number, min: 0, max: 100, required: true }, // %
      temperature: { type: Number }, // Celsius
      electricalConductivity: { type: Number }, // dS/m
      organicMatter: { type: Number, min: 0, max: 100 } // %
    },
    units: {
      ph: { type: String, default: 'pH' },
      nitrogen: { type: String, default: 'kg/ha' },
      phosphorus: { type: String, default: 'kg/ha' },
      potassium: { type: String, default: 'kg/ha' },
      moisture: { type: String, default: '%' },
      temperature: { type: String, default: '°C' },
      electricalConductivity: { type: String, default: 'dS/m' },
      organicMatter: { type: String, default: '%' }
    },
    source: {
      type: String,
      enum: ['manual', 'laboratory', 'sensor', 'external_api'],
      default: 'manual'
    },
    recommendations: [
      {
        parameter: { type: String },
        status: { type: String, enum: ['optimal', 'low', 'high', 'critical'] },
        advisory: { type: String },
        action: { type: String }
      }
    ],
    measuredAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const SoilRecord = mongoose.model('SoilRecord', soilRecordSchema);
