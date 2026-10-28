import { Product } from '../../models/Product.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const listProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, status } = req.query;

    const filter = {};

    // Normal users only see approved and active products
    if (req.user?.role !== 'admin') {
      filter.approvalStatus = 'approved';
      filter.isActive = true;
    } else if (status) {
      filter.approvalStatus = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate('sellerId', 'name email phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, products, 'Products retrieved');
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'name email phone');
    if (!product) return sendError(res, 'Product not found', 404);

    return sendSuccess(res, product, 'Product details retrieved');
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, unit, stock, images } = req.body;

    if (!name || !description || price === undefined || !stock || !unit) {
      return sendError(res, 'Name, description, price, unit, and stock are required', 400);
    }

    if (price < 0 || stock < 0) {
      return sendError(res, 'Price and stock must be positive numbers', 400);
    }

    // Admins auto-approve; other users submit as pending approval
    const approvalStatus = req.user.role === 'admin' ? 'approved' : 'pending';

    const product = await Product.create({
      sellerId: req.user._id,
      name: name.trim(),
      description: description.trim(),
      category: category || 'seeds',
      price: Number(price),
      currency: 'INR',
      unit: unit.trim(),
      stock: Number(stock),
      images: images || [],
      approvalStatus,
      isActive: true
    });

    return sendSuccess(res, product, 'Product submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found', 404);

    if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied. You do not own this product.', 403);
    }

    const { name, description, category, price, unit, stock, images, isActive } = req.body;

    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (unit) product.unit = unit.trim();
    if (stock !== undefined) product.stock = Number(stock);
    if (images) product.images = images;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();
    return sendSuccess(res, product, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found', 404);

    if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    product.isActive = false;
    await product.save();
    return sendSuccess(res, product, 'Product deactivated');
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { id: 'all', name: 'All Categories' },
      { id: 'seeds', name: 'Certified Seeds' },
      { id: 'fertilizers', name: 'Bio & Chemical Fertilizers' },
      { id: 'soil_amendments', name: 'Soil Conditioners & Lime' },
      { id: 'irrigation_equipment', name: 'Drip & Sprinkler Tools' },
      { id: 'tools', name: 'Farm Implements & Tools' },
      { id: 'crop_protection', name: 'Eco-friendly Pesticides' },
      { id: 'other', name: 'Other Agricultural Supplies' }
    ];

    const counts = await Product.aggregate([
      { $match: { approvalStatus: 'approved', isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const enriched = categories.map((cat) => ({
      ...cat,
      count: cat.id === 'all'
        ? Object.values(countMap).reduce((a, b) => a + b, 0)
        : countMap[cat.id] || 0
    }));

    return sendSuccess(res, enriched, 'Categories retrieved');
  } catch (err) {
    next(err);
  }
};
