const mongoose = require('mongoose');

const seatUpdateSchema = mongoose.Schema({
  cafeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  previousSeats: {
    type: Number,
    required: true,
    min: 0,
  },
  updatedSeats: {
    type: Number,
    required: true,
    min: 0,
  },
  previousStatus: {
    type: String,
    enum: ['Available', 'Filling', 'Full'],
  },
  updatedStatus: {
    type: String,
    enum: ['Available', 'Filling', 'Full'],
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

const SeatUpdate = mongoose.model('SeatUpdate', seatUpdateSchema);

module.exports = SeatUpdate;