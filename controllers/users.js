const express = require('express');
const router = express.Router();
const User = require('../models/user');
const AdminProfile = require('../models/Admin.js');


router.get('/', async (_req, res) => {
  try {
    const users = await User.find({}, 'username role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


router.get('/current-user', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-hashedPassword');

    if (user?.role === 'admin') {
      const adminProfile = await AdminProfile.findOne({ userId: user._id });
      return res.json({ ...user.toObject(), adminProfile });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-hashedPassword');
    if (!user) return res.status(404).json({ err: 'User not found' });

    if (user.role === 'admin') {
      const adminProfile = await AdminProfile.findOne({ userId: user._id });
      return res.json({ ...user.toObject(), adminProfile });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.put('/:id/permissions', async (req, res) => {
  try {
    const { permissions } = req.body;

    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ err: 'Not authorized' });
    }

    let adminProfile = await AdminProfile.findOne({ userId: req.params.id });

    if (!adminProfile) {
      adminProfile = new AdminProfile({
        userId: req.params.id,
        permissions: permissions || [],
      });
    } else {
      adminProfile.permissions = permissions || [];
    }

    await adminProfile.save();

    const user = await User.findById(req.params.id).select('-hashedPassword');
    res.json({ ...user.toObject(), adminProfile });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


router.post('/:id/profile', async (req, res) => {
  try {
    const { permissions, displayName, notes } = req.body;

    const existing = await AdminProfile.findOne({ userId: req.params.id });
    if (existing) return res.status(400).json({ err: 'Profile already exists' });

    const profile = await AdminProfile.create({
      userId: req.params.id,
      permissions: permissions || [],
      displayName,
      notes,
    });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


router.get('/:id/profile', async (req, res) => {
  try {
    const profile = await AdminProfile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ err: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


router.put('/:id/profile', async (req, res) => {
  try {
    const { permissions, displayName, notes } = req.body;
    const profile = await AdminProfile.findOneAndUpdate(
      { userId: req.params.id },
      { permissions, displayName, notes },
      { new: true }
    );
    if (!profile) return res.status(404).json({ err: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


router.delete('/:id/profile', async (req, res) => {
  try {
    const profile = await AdminProfile.findOneAndDelete({ userId: req.params.id });
    if (!profile) return res.status(404).json({ err: 'Profile not found' });
    res.json({ message: 'Profile deleted', profile });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
