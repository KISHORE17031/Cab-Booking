const express = require('express');
const router = express.Router();
const {
  requestRide,
  getPendingRides,
  acceptRide,
  startRide,
  completeRide,
  payRide,
  rateDriver,
  getRiderRides,
  getDriverRides,
  getAllRides,
  updateRideStatus
} = require('../controllers/rideController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/request', protect, requestRide);
router.get('/pending', protect, getPendingRides);
router.put('/accept/:id', protect, acceptRide);
router.put('/start/:id', protect, startRide);
router.put('/complete/:id', protect, completeRide);
router.post('/pay', protect, payRide);
router.post('/rate', protect, rateDriver);
router.get('/rider/history', protect, getRiderRides);
router.get('/driver/history', protect, getDriverRides);
router.get('/admin/all', protect, adminOnly, getAllRides);
router.put('/admin/status/:id', protect, adminOnly, updateRideStatus);

module.exports = router;
