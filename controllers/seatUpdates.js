const express = require('express');
const router = express.Router();
const SeatUpdate = require('../models/SeatUpdate');

router.get('/', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const updates = await SeatUpdate.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('cafeId', 'name emoji')
      .populate('adminId', 'username email');

    const total = await SeatUpdate.countDocuments();

    res.json({
      updates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/cafe/:cafeId', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { cafeId } = req.params;

    const updates = await SeatUpdate.find({ cafeId })
      .populate('adminId', 'username email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      updates,
      totalUpdates: updates.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:updateId', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { updateId } = req.params;

    const update = await SeatUpdate.findById(updateId)
      .populate('cafeId', 'name emoji location')
      .populate('adminId', 'username email');

    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    res.json(update);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;