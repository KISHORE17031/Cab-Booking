const Ride = require('../models/Ride');
const Car = require('../models/Car');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');

// 1. Rider requests a ride
const requestRide = async (req, res) => {
  const { carId, pickupLocation, dropLocation, bookingDate } = req.body;
  const riderId = req.user._id;

  try {
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Cab not found' });
    }

    // Dynamic fare calculation
    const estimatedDistance = Math.max(5, Math.round((pickupLocation.length + dropLocation.length) * 0.8));
    const fare = Math.round(estimatedDistance * car.pricePerKm);

    const ride = await Ride.create({
      riderId,
      carId,
      pickupLocation,
      dropLocation,
      bookingDate: new Date(bookingDate),
      fare,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Ride requested successfully. Waiting for driver assignment...',
      ride
    });
  } catch (error) {
    console.error('Request ride error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get pending rides (for drivers to accept)
const getPendingRides = async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'pending' })
      .populate('riderId', 'name phone')
      .populate('carId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error('Get pending rides error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Driver accepts ride request
const acceptRide = async (req, res) => {
  const { id } = req.params;
  const driverId = req.user._id;

  try {
    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Ride has already been accepted or processed' });
    }

    ride.driverId = driverId;
    ride.status = 'accepted';
    await ride.save();

    // Mark driver as unavailable (busy)
    await User.findByIdAndUpdate(driverId, { isAvailable: false });

    return res.status(200).json({
      success: true,
      message: 'Ride accepted successfully. Drive to pickup location.',
      ride
    });
  } catch (error) {
    console.error('Accept ride error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Driver starts the trip
const startRide = async (req, res) => {
  const { id } = req.params;

  try {
    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Ride cannot be started from current state' });
    }

    ride.status = 'started';
    await ride.save();

    return res.status(200).json({
      success: true,
      message: 'Trip started successfully. Happy journey!',
      ride
    });
  } catch (error) {
    console.error('Start ride error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Driver completes the trip
const completeRide = async (req, res) => {
  const { id } = req.params;

  try {
    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.status !== 'started') {
      return res.status(400).json({ success: false, message: 'Only started rides can be completed' });
    }

    ride.status = 'completed';
    await ride.save();

    // Release driver availability
    if (ride.driverId) {
      await User.findByIdAndUpdate(ride.driverId, { isAvailable: true });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip completed successfully. Awaiting payment.',
      ride
    });
  } catch (error) {
    console.error('Complete ride error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Rider completes simulated cashless payment
const payRide = async (req, res) => {
  const { rideId, amount, paymentMethod } = req.body;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride record not found' });
    }

    if (ride.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'This ride has already been paid for' });
    }

    const transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const payment = await Payment.create({
      rideId,
      amount: Number(amount) || ride.fare,
      paymentMethod: paymentMethod || 'Cashless Wallet',
      transactionId
    });

    ride.paymentStatus = 'paid';
    await ride.save();

    return res.status(201).json({
      success: true,
      message: 'Checkout payment processed successfully',
      payment
    });
  } catch (error) {
    console.error('Pay ride error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Rider rates driver
const rateDriver = async (req, res) => {
  const { rideId, driverId, stars, comment } = req.body;
  const riderId = req.user._id;

  try {
    const alreadyRated = await Rating.findOne({ rideId, riderId });
    if (alreadyRated) {
      return res.status(400).json({ success: false, message: 'You have already submitted feedback for this ride' });
    }

    const rating = await Rating.create({
      rideId,
      riderId,
      driverId,
      stars: Number(stars),
      comment: comment || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      rating
    });
  } catch (error) {
    console.error('Rate driver error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Rider history logs
const getRiderRides = async (req, res) => {
  try {
    const rides = await Ride.find({ riderId: req.user._id })
      .populate('driverId', 'name phone')
      .populate('carId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error('Get rider history error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Driver history logs
const getDriverRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driverId: req.user._id })
      .populate('riderId', 'name phone')
      .populate('carId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error('Get driver history error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 10. Admin master history logs
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find({})
      .populate('riderId', 'name email phone')
      .populate('driverId', 'name email phone')
      .populate('carId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error('Admin get all rides error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 11. Admin update ride status manually
const updateRideStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // pending, accepted, started, completed, cancelled

  try {
    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    ride.status = status;
    await ride.save();

    // Side effect: release driver if completed or cancelled
    if ((status === 'completed' || status === 'cancelled') && ride.driverId) {
      await User.findByIdAndUpdate(ride.driverId, { isAvailable: true });
    } else if (status === 'accepted' && ride.driverId) {
      await User.findByIdAndUpdate(ride.driverId, { isAvailable: false });
    }

    return res.status(200).json({
      success: true,
      message: `Ride status updated to ${status} successfully`,
      ride
    });
  } catch (error) {
    console.error('Admin update ride status error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
