const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
<<<<<<< HEAD
    createdAt       : { type: Date },
    updatedAt       : { type: Date },
    password        : { type: String, select: false },
    username        : { type: String, required: true }
=======
  createdAt       : { type: Date },
  updatedAt       : { type: Date },
  haveCar         : { type: Boolean},
  password        : { type: String, select: false },
  username        : { type: String, required: true }
>>>>>>> 08f2c24c6b9f7da0e7ad4f84195b36450fb64aa5
});

// Must use function here! ES6 => functions do not bind this!
UserSchema.pre('save', function(next) {
    // SET createdAt AND updatedAt
    const now = new Date();
    this.updatedAt = now;
    if ( !this.createdAt ) {
        this.createdAt = now;
    }
    next();
});


UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};




module.exports = mongoose.model('User', UserSchema);
