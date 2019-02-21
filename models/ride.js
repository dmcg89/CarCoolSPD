const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Populate = require('../utils/autopopulate');


mongoosePaginate.paginate.options = {
  limit: 5, // how many records per page
};

const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/CarCool', { useNewUrlParser: true });

const User = require('./user');

const RideSchema = new Schema({
  start: String,
  finish: String,
  description: String,
  time: String,
  seats: { type: Number, required: true },
  hasDriver: Boolean,
  driver: { type: Schema.Types.ObjectId, ref: 'User' },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});


RideSchema
  .pre('findOne', Populate('author'))
  .pre('find', Populate('author'));

RideSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Ride', RideSchema);
