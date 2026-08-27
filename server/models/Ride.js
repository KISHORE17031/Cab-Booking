const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Rider ID is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car/Vehicle ID is required']
  },
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required'],
    trim: true
  },
  dropLocation: {
    type: String,
    required: [true, 'Drop location is required'],
    trim: true
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  fare: {
    type: Number,
    required: [true, 'Fare estimation is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'started', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ride', RideSchema);
