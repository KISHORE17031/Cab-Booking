const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: [true, 'Ride ID is required']
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Rider ID is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver ID is required']
  },
  stars: {
    type: Number,
    required: [true, 'Rating value is required'],
    min: [1, 'Minimum star rating is 1'],
    max: [5, 'Maximum star rating is 5']
  },
  comment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rating', RatingSchema);
