const mongoose = require('mongoose');
const User = require('./models/User');
const Admin = require('./models/Admin');
const Car = require('./models/Car');
const Ride = require('./models/Ride');
const Payment = require('./models/Payment');
const Rating = require('./models/Rating');
require('dotenv').config();

const runVerification = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ucab';
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully!');

    // Clean old seeded data
    console.log('Cleaning old mock accounts...');
    await User.deleteMany({ email: { $in: ['sarahrider@gmail.com', 'johndriver@gmail.com'] } });
    await Car.deleteMany({ plateNumber: 'RIDE-READY-007' });

    // 1. Create Rider
    console.log('\n[RIDER REGISTRATION]');
    const rider = await User.create({
      name: 'Sarah Rider',
      email: 'sarahrider@gmail.com',
      password: 'password123',
      phone: '9988776655',
      role: 'rider'
    });
    console.log(`Sarah Rider created! ID: ${rider._id}`);

    // 2. Create Driver and Car
    console.log('\n[DRIVER & VEHICLE REGISTRATION]');
    const driver = new User({
      name: 'John Driver',
      email: 'johndriver@gmail.com',
      password: 'password123',
      phone: '9494089247',
      role: 'driver',
      isAvailable: true
    });
    await driver.save();

    const car = await Car.create({
      name: 'Tesla Model 3',
      model: 'Luxury',
      plateNumber: 'RIDE-READY-007',
      seats: 4,
      pricePerKm: 25,
      driverId: driver._id
    });

    driver.carId = car._id;
    await driver.save();
    console.log(`John Driver & Tesla registered! Driver ID: ${driver._id}, Car ID: ${car._id}`);

    // 3. Rider requests a ride
    console.log('\n[RIDER REQUESTS TRIP]');
    const pickupLocation = 'Sarah House, Sector 5';
    const dropLocation = 'City Airport Terminal 2';
    // mock distance: ~15km
    const fare = 15 * car.pricePerKm;

    const ride = await Ride.create({
      riderId: rider._id,
      carId: car._id,
      pickupLocation,
      dropLocation,
      bookingDate: new Date(),
      fare,
      status: 'pending'
    });
    console.log(`Ride requested! ID: ${ride._id}, Estimated Fare: \u20B9${ride.fare}, Status: ${ride.status}`);

    // 4. Driver accepts the ride
    console.log('\n[DRIVER ACCEPTS DISPATCH]');
    const acceptedRide = await Ride.findByIdAndUpdate(
      ride._id,
      { driverId: driver._id, status: 'accepted' },
      { new: true }
    );
    await User.findByIdAndUpdate(driver._id, { isAvailable: false });
    console.log(`Ride status changed! Driver assigned: ${acceptedRide.driverId}, Status: ${acceptedRide.status}`);

    // 5. Driver starts the ride
    console.log('\n[DRIVER STARTS TRIP]');
    const startedRide = await Ride.findByIdAndUpdate(
      ride._id,
      { status: 'started' },
      { new: true }
    );
    console.log(`Passenger picked up! Status: ${startedRide.status}`);

    // 6. Driver completes the ride
    console.log('\n[DRIVER COMPLETES TRIP]');
    const completedRide = await Ride.findByIdAndUpdate(
      ride._id,
      { status: 'completed' },
      { new: true }
    );
    await User.findByIdAndUpdate(driver._id, { isAvailable: true });
    console.log(`Passenger dropped off! Status: ${completedRide.status}`);

    // 7. Rider completes checkout payment
    console.log('\n[RIDER PROCESSES CASHLESS CHECKOUT]');
    const transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const payment = await Payment.create({
      rideId: ride._id,
      amount: ride.fare,
      paymentMethod: 'Cashless Card',
      transactionId
    });
    completedRide.paymentStatus = 'paid';
    await completedRide.save();
    console.log(`Checkout payment recorded! Transaction: ${payment.transactionId}, Paid: \u20B9${payment.amount}`);

    // 8. Rider rates the driver
    console.log('\n[RIDER RATINGS FEEDBACK]');
    const rating = await Rating.create({
      rideId: ride._id,
      riderId: rider._id,
      driverId: driver._id,
      stars: 5,
      comment: 'Arrived on time! Extremely comfortable ride, thank you John!'
    });
    console.log(`Rating recorded! Stars: ${rating.stars}, Comment: "${rating.comment}"`);

    // Clean up seeded data
    console.log('\nCleaning up seeded verification data...');
    await Rating.deleteOne({ _id: rating._id });
    await Payment.deleteOne({ _id: payment._id });
    await Ride.deleteOne({ _id: ride._id });
    await Car.deleteOne({ _id: car._id });
    await User.deleteMany({ _id: { $in: [rider._id, driver._id] } });
    console.log('Database rolled back successfully.');

    console.log('\nE2E ride booking and dispatch simulation verified successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

runVerification();
