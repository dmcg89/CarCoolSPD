const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../middleware/mailgun-config');

const User = require('../models/user');

module.exports = function (app) {
  // SIGN UP FORM
  app.get('/sign-up', (req, res) => {
    res.render('sign-up');
  });

  // Login form
  app.get('/login', (req, res) => {
    res.render('login');
  });

  // LOGOUT
  app.get('/logout', (req, res) => {
    res.clearCookie('nToken');
    res.redirect('/');
  });

  // SIGN UP POST
  app.post('/sign-up', (req, res) => {
    // Create User and JWT
    const user = new User(req.body);

    // eslint-disable-next-line no-shadow
    user.save().then((user) => {
      const token = jwt.sign({
        _id: user._id,
        username: user.username,
        email: user.email,
        hasCar: user.hasCar
      }, process.env.SECRET, {
        expiresIn: "60 days"
      });
      res.cookie('nToken', token, {
        maxAge: 900000,
        httpOnly: true,
      });
      res.redirect('/rides');
      sendWelcomeEmail(user);
    }).catch((err) => {
      console.log(err.message);
      return res.status(400).send({
        err,
      });
    });
  });

  // LOGIN
  app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Find this user name
    User.findOne({
      username,
    }, 'username password hasCar')
    .then(user => {
        if (!user) {
        // User not found
          return res.status(401).send({
            message: 'Wrong Username or Password'
          });
        }
        // Check the password
        user.comparePassword(password, (err, isMatch) => {
          if (!isMatch) {
          // Password does not match
            return res.status(401).send({
              message: 'Wrong Username or password',
            });
          }

          // Create a token
          console.log(user);
          const token = jwt.sign({
            _id: user._id,
            username: user.username,
            email: user.email,
            hasCar: user.hasCar,
          }, process.env.SECRET, {
            expiresIn: '60 days',
          });
          // Set a cookie and redirect to root
          res.cookie('nToken', token, {
            maxAge: 900000,
            httpOnly: true,
          });
          res.redirect('/rides');
        });
      })
    .catch(err => {
        console.log(err);
      });
  });
};
