require('dotenv').config();
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const express = require('express');

const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
const Ride = require('./models/ride');

const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));
app.use(methodOverride('_method'));

// handlebars set up
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// TEMPLATE configuration ===============================================================
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  helpers: require('handlebars-helpers')(),
}));
app.set('view engine', 'handlebars');

const checkAuth = (req, res, next) => {
  console.log('Checking authentication');
  if (typeof req.cookies.nToken === 'undefined' || req.cookies.nToken === null) {
    req.user = null;
  } else {
    const token = req.cookies.nToken;
    const decodedToken = jwt.decode(token, { complete: true }) || {};
    req.user = decodedToken.payload;
  }

  next();
};

app.use(checkAuth);

module.exports = app;

const rides = require('./controllers/routes')(app);
const auth = require('./controllers/auth')(app);
const users = require('./controllers/users')(app);

app.listen(port, () => {
  console.log('App Listening on port 3000');
});
