const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, toggleAvailability } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/availability', protect, toggleAvailability);

module.exports = router;
