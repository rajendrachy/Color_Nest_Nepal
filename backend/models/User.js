const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
  phone: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^(98|97)\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid Nepali phone number!`
    }
  },
  password: { type: String, required: true },
  address: {
    province: { type: String, default: '' },
    district: { type: String, default: '' },
    municipality: { type: String, default: '' },
    ward: { type: Number, default: null },
    street: { type: String, default: '' },
    landmark: { type: String, default: '' },
    coordinates: {
      type: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
      },
      default: {}
    }
  },
  role: { 
    type: String, 
    enum: {
      values: ['user', 'admin', 'painter'],
      message: '{VALUE} is not a valid role'
    },
    default: 'user' 
  },
  cart: {
    type: Array,
    default: []
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  twoFactorCode: String,
  twoFactorExpires: Date
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
