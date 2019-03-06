const jwt = require('jsonwebtoken');

const multer = require('multer');

const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');

const { sendWelcomeEmail } = require('../middleware/mailgun-config');

const client = new Upload(process.env.S3_BUCKET, {
  aws: {
    path: 'sign-up/avatar',
    region: process.env.S3_REGION,
    acl: 'public-read',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  cleanup: {
    versions: true,
    original: true,
  },
  versions: [{
    maxWidth: 400,
    aspect: '16:10',
    suffix: '-standard',
  }, {
    maxWidth: 300,
    aspect: '1:1',
    suffix: '-square',
  }],
});

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
  app.post('/sign-up', upload.single('avatar'), (req, res, next) => {
    // Create User and JWT
    const user = new User(req.body);
    console.log(req.body);

    user.save().then((user) => {
      var token = jwt.sign({
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
      console.log('here');
      console.log(req.file);
      console.log(user.avatarURL);

      if (req.file) {
        client.upload(req.file.path, {}, function (err, versions, meta) {
          if (err) { return res.status(400).send({ err: err }) };

          versions.forEach(function (image) {
            var urlArray = image.url.split('-');
            urlArray.pop();
            var url = urlArray.join('-');
            user.avatarURL = url;
            user.save();
            console.log(user.avatarURL);
          });

          // res.send({ user });
        });
      // } else {
      //   res.send({ user });
      }
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
            message: 'Wrong Username or password'
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
}
