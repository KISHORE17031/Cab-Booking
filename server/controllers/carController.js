const Car = require('../models/Car');
const User = require('../models/User');

const addCar = async (req, res) => {
  const { name, model, plateNumber, seats, pricePerKm, driverId } = req.body;

  try {
    const carExists = await Car.findOne({ plateNumber });
    if (carExists) {
      return res.status(400).json({ success: false, message: 'Car with this plate number already exists' });
    }

    const imageFilename = req.file ? req.file.filename : '';

    const car = await Car.create({
      name,
      model,
      plateNumber,
      seats: Number(seats),
      pricePerKm: Number(pricePerKm),
      image: imageFilename,
      driverId: driverId || null
    });

    return res.status(201).json({
      success: true,
      message: 'Car registered successfully',
      car
    });
  } catch (error) {
    console.error('Add car error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find({}).populate('driverId', 'name phone email');
    return res.status(200).json({ success: true, cars });
  } catch (error) {
    console.error('Get all cars error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCarById = async (req, res) => {
  const { id } = req.params;

  try {
    const car = await Car.findById(id).populate('driverId', 'name phone email');
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    return res.status(200).json({ success: true, car });
  } catch (error) {
    console.error('Get car error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCar = async (req, res) => {
  const { id } = req.params;
  const { name, model, plateNumber, seats, pricePerKm, status, driverId } = req.body;

  try {
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    car.name = name || car.name;
    car.model = model || car.model;
    car.plateNumber = plateNumber || car.plateNumber;
    car.seats = seats ? Number(seats) : car.seats;
    car.pricePerKm = pricePerKm ? Number(pricePerKm) : car.pricePerKm;
    car.driverId = driverId !== undefined ? driverId : car.driverId;

    if (req.file) {
      car.image = req.file.filename;
    }

    const updatedCar = await car.save();

    return res.status(200).json({
      success: true,
      message: 'Car details updated successfully',
      car: updatedCar
    });
  } catch (error) {
    console.error('Update car error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCar = async (req, res) => {
  const { id } = req.params;

  try {
    const car = await Car.findByIdAndDelete(id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    return res.status(200).json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar
};
