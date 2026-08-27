const express = require('express');
const router = express.Router();
const { addCar, getAllCars, getCarById, updateCar, deleteCar } = require('../controllers/carController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');

router.post('/', protect, adminOnly, upload.single('image'), addCar);
router.get('/', protect, getAllCars);
router.get('/:id', protect, getCarById);
router.put('/:id', protect, adminOnly, upload.single('image'), updateCar);
router.delete('/:id', protect, adminOnly, deleteCar);

module.exports = router;
