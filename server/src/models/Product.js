import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['seeds', 'fertilizers', 'soil_amendments', 'irrigation_equipment', 'tools', 'crop_protection', 'other'],
      default: 'seeds',
      index: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be non-negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    unit: {
      type: String,
      required: true,
      default: 'kg'
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    images: [{ type: String }],
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // seeded and admin products approved by default
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Product = mongoose.model('Product', productSchema);
