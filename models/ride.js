const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGODB_URI ||'mongodb://localhost/intensive', { useNewUrlParser: true});

const User = require('./user');


const Ride = mongoose.model('Ride', {
    route: String,
    description: String,
    time: String,
    seats: { type : Number, required: true },
    hasDriver: Boolean,
    users: [User.schema],
    author : { type: Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = Ride;
