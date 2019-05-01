const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

// Add car object

const UserSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  hasCar: { type: Boolean },
  password: { type: String, select: false },
  username: { type: String, required: true },
  email: { type: String },
  rides: [{ type: Schema.Types.ObjectId, ref: 'Ride' }],
  avatarURL: { type: String },
  // resetToken: { type: String },
  // resetExpire: { type: String }
});

// Must use function here! ES6 => functions do not bind this!
UserSchema.pre('save', function(next) {
  // SET createdAt AND updatedAt
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  // ENCRYPT PASSWORD
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      next();
    });
  });
});

// Need to use function to enable this.password to work.
UserSchema.methods.comparePassword = function (password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
