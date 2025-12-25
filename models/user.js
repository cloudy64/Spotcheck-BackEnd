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
  token: {
    type: String,
    required: false,
  },
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
