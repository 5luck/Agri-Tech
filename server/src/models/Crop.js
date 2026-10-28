import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },
    variety: {
      type: String,
      trim: true,
      default: ''
    },
    plantingDate: {
      type: Date,
      required: [true, 'Planting date is required']
    },
    expectedHarvestDate: {
      type: Date
    },
    growthStage: {
      type: String,
      enum: ['seedling', 'vegetative', 'flowering', 'ripening', 'harvest-ready', 'harvested'],
      default: 'vegetative'
    },
    cultivatedArea: {
      type: Number,
      required: true,
      min: [0.01, 'Cultivated area must be positive']
    },
    irrigationMethod: {
      type: String,
      trim: true,
      default: 'Drip'
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'harvested', 'archived'],
      default: 'active',
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    activities: [
      {
        title: { type: String, required: true },
        type: { type: String, enum: ['irrigation', 'fertilization', 'pest_control', 'inspection', 'harvest', 'other'], default: 'inspection' },
        dueDate: { type: Date, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        notes: { type: String, default: '' }
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Crop = mongoose.model('Crop', cropSchema);
