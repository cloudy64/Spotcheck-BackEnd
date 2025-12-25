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
  if (req.user.role !== 'admin') {
    return res.status(403).json({ err: 'Not authorized' });
  }

  const cafe = await Cafe.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json(cafe);
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
