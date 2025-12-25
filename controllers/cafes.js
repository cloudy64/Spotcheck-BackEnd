const express = require('express');
const Cafe = require('../models/cafe');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const cafes = await Cafe.find();
    
    res.status(200).json(cafes);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.post('/', async (req, res) => {

  try {
    res.status(400).json({ 'user': req.body });

    if (req.user.role !== 'admin') {
      return res.status(403).json({ err: 'Not authorized' });
    }

    const {
      name,
      location,
      description,
      seatsTotal = 0,
      seatsAvailable = 0,
      photo,
    } = req.body;

    const cafe = await Cafe.create({
      name,
      location,
      description,
      seatsTotal,
      seatsAvailable,
      photo,
      createdBy: req.user._id,
    });

    res.status(201).json(cafe);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ err: 'Not authorized' });
    }

    const cafe = await Cafe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!cafe) return res.status(404).json({ err: 'Cafe not found' });
    res.json(cafe);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ err: 'Not authorized' });
    }

    const cafe = await Cafe.findByIdAndDelete(req.params.id);
    if (!cafe) return res.status(404).json({ err: 'Cafe not found' });

    res.json({ message: 'Cafe deleted', cafe });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
