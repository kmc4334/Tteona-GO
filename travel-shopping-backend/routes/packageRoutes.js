const express = require('express');
const {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  addItemToPackage,
  removeItemFromPackage,
  deletePackage,
} = require('../controllers/packageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All package routes require auth

router.get('/', getPackages);
router.post('/', createPackage);
router.get('/:id', getPackageById);
router.put('/:id', updatePackage);
router.delete('/:id', deletePackage);
router.post('/:id/items', addItemToPackage);
router.delete('/:id/items/:productId', removeItemFromPackage);

module.exports = router;
