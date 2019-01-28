

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI ||'mongodb://localhost/intensive', { useNewUrlParser: true});



const Ride = mongoose.model('Ride', {
    route: String,
    description: String,
    time: String,
    dropDown: Number,
});

module.exports = Ride;
