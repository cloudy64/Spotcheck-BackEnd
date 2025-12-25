const mongoose = require('mongoose');

const cafeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  emoji: {
    type: String,
    default: '☕',
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['Available', 'Filling', 'Full'],
    default: 'Available',
  },
  photo: {
    type: String,
  },
  hours: {
    weekday: {
      open: { type: String, default: '07:00' },
      close: { type: String, default: '23:00' },
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
    },
    sunday: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '20:00' },
    },
  },
  amenities: {
    wifi: { type: Boolean, default: true },
    powerOutlets: { type: Boolean, default: true },
    quietZone: { type: Boolean, default: false },
    foodAvailable: { type: Boolean, default: true },
  },
  noiseLevel: {
    type: String,
    enum: ['Quiet', 'Moderate', 'Loud'],
    default: 'Moderate',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
}, { timestamps: true });

cafeSchema.pre('save', function(next) {
  if (this.isModified('availableSeats') || this.isModified('totalSeats')) {
    const percentage = (this.availableSeats / this.totalSeats) * 100;
    
    if (percentage >= 70) {
      this.status = 'Available';
    } else if (percentage >= 30) {
      this.status = 'Filling';
    } else {
      this.status = 'Full';
    }
  }
  next();
});

const Cafe = mongoose.model('Cafes', cafeSchema);

module.exports = Cafe;