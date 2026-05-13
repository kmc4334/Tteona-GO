const Package = require('../models/Package');

// @desc    Get all packages for current user
// @route   GET /api/packages
// @access  Private
exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Private
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findOne({ _id: req.params.id, userId: req.user.id });
    if (!pkg) {
      return res.status(404).json({ success: false, message: '패키지를 찾을 수 없습니다.' });
    }
    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new package
// @route   POST /api/packages
// @access  Private
exports.createPackage = async (req, res) => {
  try {
    const { name, items, totalDays } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '패키지 이름을 입력해주세요.' });
    }

    const pkg = await Package.create({
      userId: req.user.id,
      name,
      items: items || [],
      totalDays: totalDays || 3,
    });

    res.status(201).json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private
exports.updatePackage = async (req, res) => {
  try {
    const { name, items, totalDays } = req.body;

    const pkg = await Package.findOne({ _id: req.params.id, userId: req.user.id });
    if (!pkg) {
      return res.status(404).json({ success: false, message: '패키지를 찾을 수 없습니다.' });
    }

    if (name !== undefined) pkg.name = name;
    if (items !== undefined) pkg.items = items;
    if (totalDays !== undefined) pkg.totalDays = totalDays;
    pkg.updatedAt = Date.now();

    await pkg.save();
    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to package
// @route   POST /api/packages/:id/items
// @access  Private
exports.addItemToPackage = async (req, res) => {
  try {
    const { productId, title, image, timeSlot, day, price, category } = req.body;

    const pkg = await Package.findOne({ _id: req.params.id, userId: req.user.id });
    if (!pkg) {
      return res.status(404).json({ success: false, message: '패키지를 찾을 수 없습니다.' });
    }

    pkg.items.push({ productId, title, image, timeSlot, day, price, category });
    pkg.updatedAt = Date.now();
    await pkg.save();

    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from package
// @route   DELETE /api/packages/:id/items/:productId
// @access  Private
exports.removeItemFromPackage = async (req, res) => {
  try {
    const pkg = await Package.findOne({ _id: req.params.id, userId: req.user.id });
    if (!pkg) {
      return res.status(404).json({ success: false, message: '패키지를 찾을 수 없습니다.' });
    }

    pkg.items = pkg.items.filter(item => item.productId !== req.params.productId);
    pkg.updatedAt = Date.now();
    await pkg.save();

    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!pkg) {
      return res.status(404).json({ success: false, message: '패키지를 찾을 수 없습니다.' });
    }
    res.json({ success: true, message: '패키지가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
