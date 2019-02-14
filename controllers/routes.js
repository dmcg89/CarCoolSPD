const jwt = require('jsonwebtoken');
const Ride = require('../models/ride');
const User = require('../models/user');


//  index

module.exports = function (app, Ride) {
  app.get('/', (req, res) => {
    const currentUser = req.user;
    console.log(currentUser);
    Ride.find()
      .then(rides => {
        res.render('rides-index', { rides: rides, currentUser });
      })
      .catch(err => {
        console.log(err);
      });
  });
  // Search
  app.get('/search', (req, res) => {
    term = new RegExp(req.query.term, 'i')

    Ride.find( {'route': term} ).exec((err, rides) => {
      res.render('rides-index', { rides });
    });
  });
  // show

  app.get('/rides/view/:id', (req, res) => {
    const currentUser = req.user;
        Ride.findById(req.params.id).then((ride) => {
            res.render('rides-show', { ride: ride, currentUser })
        }).catch((err) => {
            console.log(err.message);
        })
    });

    // delete

    app.delete('/rides/view/:id', function (req, res) {
        console.log("Delete Ride");
        Ride.findByIdAndRemove(req.params.id).then((ride) => {
            res.redirect('/');
        }).catch((err) => {
            console.log(err.message);
        })
    })
    // edit page
    app.get('/rides/view/:id/edit', (req, res) => {
        var currentUser = req.user;
        Ride.findById(req.params.id, function(err, ride) {
            res.render('rides-edit', { ride: ride, currentUser });
        })
    })


    // app.post('/rides/view', (req, res) => {
    //     console.log(req.body);
    //     Ride.create(req.body).then((ride) => {
    //         console.log(ride);
    //         res.redirect(`/rides/view/${ride._id}`);
    //     }).catch((err) => {
    //         console.log(err.message);
    //     })
    // })

    app.post("/rides/view", (req, res) => {
      console.log(req.user)
      if (req.user) {
        var ride = new Ride(req.body);
        ride.author = req.user._id;
        console.log(ride.author)

        ride
          .save()
          .then(ride => {
            return User.findById(req.user._id);
          })
          .then(user => {
            user.rides.unshift(ride);
            user.save();
            // REDIRECT TO THE NEW POST
            res.redirect("/rides/view/" + ride._id);
          })
          .catch(err => {
            console.log("failed!")
            console.log(err.message);
          });
    } else {
        console.log("failed authentication!")
        return res.status(401); // UNAUTHORIZED
    }
});


    app.put('/rides/view/:id', (req, res) => {
        Ride.findByIdAndUpdate(req.params.id, req.body)
        .then(ride => {
            res.redirect(`/rides/view/${ride._id}`)
        })
        .catch(err => {
            console.log(err.message);
        })
    })

    app.get('/rides', (req, res) => {
        var currentUser = req.user;
        res.render('rides-index', {currentUser})
    })


    app.get('/rides/new', (req, res) => {
        var currentUser = req.user;
        res.render('rides-new', {currentUser});
    })

    // SIGN UP FORM
    app.get('/sign-up', (req, res) => {
        res.render('sign-up');
    });

    // Login form
    app.get('/login', (req, res) =>{
        res.render('login')
    })

    // LOGOUT
    app.get('/logout', (req, res) => {
        res.clearCookie('nToken');
        res.redirect('/');
    });

    // SIGN UP POST
      app.post('/sign-up', (req, res) => {
        // Create User and JWT
        const user = new User(req.body);

        user.save().then((user) => {
          var token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, { expiresIn: "60 days" });
          res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
          res.redirect('/');
        }).catch((err) => {
          console.log(err.message);
          return res.status(400).send({ err: err });
        });
      });

    // LOGIN
    app.post("/login", (req, res) => {
      console.log("this ran the login post")
        const username = req.body.username;
        const password = req.body.password;
        console.log(username);
        console.log(password);
        // Find this user name
        User.findOne({ username }, "username password")
            .then(user => {
                if (!user) {
                    // User not found
                    return res.status(401).send({ message: "Wrong Username or Password" });
                }
                // Check the password
                user.comparePassword(password, (err, isMatch) => {
                    if (!isMatch) {
                        // Password does not match
                        return res.status(401).send({ message: "Wrong Username or password" });
                    }

                    // Create a token
                    console.log(user)
                    const token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, {
                        expiresIn: "60 days"
                    });
                    // Set a cookie and redirect to root
                    res.cookie("nToken", token, { maxAge: 900000, httpOnly: true });
                    res.redirect("/");
                });
            })
            .catch(err => {
                console.log(err);
            });
    });
}
