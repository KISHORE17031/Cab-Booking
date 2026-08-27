const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAllUsers, updateUser, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
