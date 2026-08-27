const mongoose = require('mongoose');
const Admin = require('./models/AdminSchema');
const User = require('./models/UserSchema');
const Car = require('./models/CarSchema');
const MyBooking = require('./models/MyBookingSchema');
require('dotenv').config();

const runTest = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ucab';
    console.log(`Database URI: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('Database connection successful!');

    console.log('Cleaning up existing test items if any...');
    await Admin.deleteMany({ email: 'testadmin@ucab.com' });
    await User.deleteMany({ email: 'testuser@ucab.com' });
    await Car.deleteMany({ plateNumber: 'TEST-PLATE-123' });

    // 1. Seed Admin
    console.log('Creating Admin account...');
    const admin = await Admin.create({
      username: 'testadmin',
      email: 'testadmin@ucab.com',
      password: 'password123'
    });
    console.log('Admin account created successfully:', admin.username);

    // 2. Seed User
    console.log('Creating User (Rider) account...');
    const user = await User.create({
      name: 'Sarah Rider',
      email: 'testuser@ucab.com',
      password: 'password123',
      phone: '9988776655',
      role: 'user'
    });
    console.log('User account created successfully:', user.name);

    // 3. Seed Car
    console.log('Creating Car record...');
    const car = await Car.create({
      name: 'Sedan Swift Dzire',
      model: 'Sedan',
      plateNumber: 'TEST-PLATE-123',
      seats: 4,
      pricePerKm: 15,
      status: 'available'
    });
    console.log('Car record created successfully:', car.name);

    // 4. Create Booking
    console.log('Creating Cab Booking...');
    const booking = await MyBooking.create({
      userId: user._id,
      carId: car._id,
      pickupLocation: 'Sarah House, Sector 5',
      dropLocation: 'International Airport T3',
      bookingDate: new Date(),
      status: 'pending',
      totalFare: 20 * car.pricePerKm
    });
    console.log('Booking recorded successfully! ID:', booking._id);

    // Verify relations
    console.log('Querying and populating relationships...');
    const populated = await MyBooking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('carId');
    
    console.log('Populated Booking Log Detail:');
    console.log(JSON.stringify(populated, null, 2));

    // Cleanup
    console.log('Cleaning up seeded test entries from database...');
    await MyBooking.deleteOne({ _id: booking._id });
    await Admin.deleteOne({ _id: admin._id });
    await User.deleteOne({ _id: user._id });
    await Car.deleteOne({ _id: car._id });
    console.log('Database clean-up completed.');

    console.log('Database schema and verification tests passed successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Test execution failed:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

runTest();
