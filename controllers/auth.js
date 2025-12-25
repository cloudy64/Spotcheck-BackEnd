const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

router.post('/sign-up', async (req, res) => {

  try {
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (userInDatabase) {
      return res.status(409).json({
        err: 'Username or Password is invalid',
      });
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const role = req.body.role === 'admin' ? 'admin' : 'customer';
  
    const token = jwt.sign({
      username: req.body.username,
      role: req.body.role,
    }, process.env.JWT_SECRET);
    console.log(token);

    const newUser = await User.create({
      username: req.body.username,
      hashedPassword,
      role,
      token,
    });

    res.json({ token, user: newUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: 'Something went wrong!' });
  }
});

router.post('/sign-in', async (req, res) => {

  try {
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (!userInDatabase) {
      return res.status(401).json({ err: 'Username or Password is invalid' });
    }

    const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.hashedPassword);

    if (!validPassword) {
      return res.status(401).json({ err: 'Username or Password is invalid' });
    }

    const payload = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
      role: userInDatabase.role,
    };
   
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.json({ token, user: userInDatabase });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: 'Invalid Username or Password' });
  }
});

module.exports = router;
