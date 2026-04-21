const Paint = require('../models/Paint');

exports.getPaints = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort } = req.query;
    let query = {};

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.pricePerLiter = {};
      if (minPrice) query.pricePerLiter.$gte = Number(minPrice);
      if (maxPrice) query.pricePerLiter.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { colorName: { $regex: search, $options: 'i' } },
        { colorCode: { $regex: search, $options: 'i' } }
      ];
    }

    let paints = Paint.find(query);

    if (sort) {
      const sortBy = sort.split(',').join(' ');
      paints = paints.sort(sortBy);
    } else {
      paints = paints.sort('-createdAt');
    }

    const result = await paints;
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaintById = async (req, res) => {
  try {
    const paint = await Paint.findById(req.params.id).populate('reviews.user', 'name');
    if (!paint) return res.status(404).json({ message: 'Paint not found' });
    res.json(paint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPaint = async (req, res) => {
  try {
    const paint = await Paint.create(req.body);
    res.status(201).json(paint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaint = async (req, res) => {
  try {
    const paint = await Paint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!paint) return res.status(404).json({ message: 'Paint not found' });
    res.json(paint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePaint = async (req, res) => {
  try {
    const paint = await Paint.findByIdAndDelete(req.params.id);
    if (!paint) return res.status(404).json({ message: 'Paint not found' });
    res.json({ message: 'Paint removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
