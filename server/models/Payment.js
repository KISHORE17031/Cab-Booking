const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: [true, 'Ride ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required']
  },
  paymentMethod: {
    type: String,
    default: 'Cashless Wallet'
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);
