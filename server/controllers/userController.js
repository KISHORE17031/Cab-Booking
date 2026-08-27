const User = require('../models/User');
const Car = require('../models/Car');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'ucab_secret_jwt_key_12345', {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res) => {
  const { name, email, password, phone, role, carName, carModel, plateNumber, seats, pricePerKm } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account already exists with this email' });
    }

    // 1. Create base user
    const user = new User({
      name,
      email,
      password,
      phone,
      role: role || 'rider'
    });

    // 2. Handle Driver role: link vehicle setup
    if (role === 'driver') {
      if (!carName || !plateNumber || !seats || !pricePerKm) {
        return res.status(400).json({
          success: false,
          message: 'Driver registration requires vehicle details (name, plate number, seats, price per km)'
        });
      }

      const carExists = await Car.findOne({ plateNumber });
      if (carExists) {
        return res.status(400).json({ success: false, message: 'A vehicle with this plate number is already registered' });
      }

      // Save user to obtain user._id
      await user.save();

      // Create car associated with the driver
      const carImage = req.file ? req.file.filename : '';
      const car = await Car.create({
        name: carName,
        model: carModel || 'Sedan',
        plateNumber,
        seats: Number(seats),
        pricePerKm: Number(pricePerKm),
        image: carImage,
        driverId: user._id
      });

      // Link back car to driver profile
      user.carId = car._id;
      user.isAvailable = true; // online by default
      await user.save();
    } else {
      // Save standard rider
      await user.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAvailable: user.isAvailable,
        carId: user.carId
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('carId');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAvailable: user.isAvailable,
        carId: user.carId
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('carId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'driver') {
      return res.status(400).json({ success: false, message: 'Driver account not found' });
    }

    user.isAvailable = !user.isAvailable;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Status updated to ${user.isAvailable ? 'Online' : 'Offline'}`,
      isAvailable: user.isAvailable
    });
  } catch (error) {
    console.error('Toggle availability error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  toggleAvailability
};
