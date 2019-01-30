require('dotenv').config()
const methodOverride = require('method-override');
var cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const express = require('express');
const app = express();
var exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true}));
const Ride = require('./models/ride');
const port = process.env.PORT || 3000;




app.use(cookieParser());

app.use(methodOverride('_method'));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

module.exports = app;

const rides = require('./controllers/routes')(app, Ride);

app.listen(port, () => {
    console.log('App Listening on port 3000');
});
