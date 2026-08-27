const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Car model/type is required'],
    enum: ['Mini', 'Sedan', 'SUV', 'Luxury'],
    default: 'Sedan'
  },
  plateNumber: {
    type: String,
    required: [true, 'Plate number is required'],
    unique: true,
    trim: true
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required']
  },
  pricePerKm: {
    type: Number,
    required: [true, 'Price per km is required']
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'booked'],
    default: 'available'
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Car', CarSchema);
