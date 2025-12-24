const Cafe = require('../models/cafe');
const SeatUpdate = require('../models/SeatUpdate');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const cafes = await Cafe.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json(cafes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/status/:statusName', async (req, res) => {
  try {
    const { statusName } = req.params;

    const validStatuses = ['Available', 'Filling', 'Full'];

    if (!validStatuses.includes(statusName)) {
      return res.status(400).json({ error: 'Invalid status name' });
    }

    const cafes = await Cafe.find({ status: statusName })
      .populate('createdBy', 'username email');

    res.status(200).json(cafes);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id)
      .populate('createdBy', 'username email');
      
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });
    res.status(200).json(cafe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, location, totalSeats } = req.body;

    if (!name || !location || !totalSeats) {
      return res.status(400).json({ error: 'Name, location, and total seats are required' });
    }

    const createdBy = req.user._id;

    const createdCafe = await Cafe.create({
      ...req.body,
      createdBy
    });

    res.status(201).json(createdCafe);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Cafe name already exists' });
    }
    res.status(500).json({ err: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });

    const updated = await Cafe.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    res.status(200).json(updated);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/seats', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { availableSeats, notes } = req.body;

    if (availableSeats === undefined) {
      return res.status(400).json({ error: 'availableSeats is required' });
    }

    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });

    const previousSeats = cafe.availableSeats;
    const previousStatus = cafe.status;

    cafe.availableSeats = availableSeats;
    await cafe.save();

    await SeatUpdate.create({
      cafeId: cafe._id,
      adminId: req.user._id,
      previousSeats,
      updatedSeats: availableSeats,
      previousStatus,
      updatedStatus: cafe.status,
      notes: notes || '',
    });

    res.status(200).json(cafe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a cafe (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) return res.status(404).json({ message: 'Cafe not found' });

    await cafe.deleteOne();
    await SeatUpdate.deleteMany({ cafeId: req.params.id });

    res.status(200).json({ message: 'Cafe deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/stats/overview', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const totalCafes = await Cafe.countDocuments();
    const cafes = await Cafe.find();
    
    const totalAvailableSeats = cafes.reduce((sum, cafe) => sum + cafe.availableSeats, 0);
    const totalSeats = cafes.reduce((sum, cafe) => sum + cafe.totalSeats, 0);
    const averageOccupancy = totalSeats > 0 ? ((totalSeats - totalAvailableSeats) / totalSeats * 100).toFixed(2) : 0;
    
    const fullCafes = cafes.filter(cafe => cafe.status === 'Full').length;
    const availableCafes = cafes.filter(cafe => cafe.status === 'Available').length;
    const fillingCafes = cafes.filter(cafe => cafe.status === 'Filling').length;

    res.status(200).json({
      totalCafes,
      totalAvailableSeats,
      totalSeats,
      averageOccupancy: parseFloat(averageOccupancy),
      fullCafes,
      availableCafes,
      fillingCafes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;