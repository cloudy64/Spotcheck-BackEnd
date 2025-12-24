const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  hashedPassword: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    enum: ['Customer', 'admin'],
    default: 'Customer',
    required: true,
  },
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
