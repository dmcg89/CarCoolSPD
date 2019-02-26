const jwt = require('jsonwebtoken');
const Ride = require('../models/ride');
const User = require('../models/user');


//  index

module.exports = function (app) {
  app.get('/rides', (req, res) => {
    const currentUser = req.user;
    Ride.find()
      .then(rides => {
        res.render('rides-index', { rides: rides, currentUser });
      })
      .catch(err => {
        console.log(err);
      });
  });

  app.get('/users/:id', (req, res) => {
    const currentUser = req.user;
    User.findById(req.params.id).then((user) => {
      res.render('user-show', { currentUser, user });
    }).catch((err) => {
      console.log(err.message);
    });
  });

  //  add rider to ride
  app.post('/rides/view/:id/adduser', (req, res) => {
    const currentUser = req.user;
    console.log(req.body);
    Ride.findById(req.params.id).then((ride) => {
      if (currentUser) {
        ride.users.push(currentUser);
        ride.save();
        res.redirect(`/rides/view/${ride._id}`);
      } else {
        console.log('user not logged in');
        res.redirect('/login');
      }
    }).catch((err) => {
      console.log(err.message);
    });
  });

  // Search
  app.get('/search', (req, res) => {
    const term = new RegExp(req.query.term, 'i');

    Ride.find({
      $or: [
        { start: term },
        { finish: term },
      ],


    }).exec((err, rides) => {
      res.render('rides-index', { rides });
    });
  });
  // show

  app.get('/rides/view/:id', (req, res) => {
    const currentUser = req.user;
    console.log(currentUser);
    Ride.findById(req.params.id).then((ride) => {
      let userIsAuthor;
      if (currentUser) {
        console.log(currentUser._id);
        console.log(ride.author._id);
        console.log(ride.users);

        userIsAuthor = (currentUser._id == ride.author._id);
      } else {
        userIsAuthor = false;
      }
      console.log(userIsAuthor);
      const seatsLeft = ride.seats - ride.users.length;
      User.find({
        _id: ride.users
      }).then (riders => {
        console.log(riders)
        res.render('rides-show', { ride, currentUser, userIsAuthor, seatsLeft, riders })
      });
      console.log(seatsLeft);
    }).catch((err) => {
      console.log(err.message);
    });
  });

    // delete

  app.delete('/rides/view/:id', function (req, res) {
    console.log("Delete Ride");
     Ride.findByIdAndRemove(req.params.id).then((ride) => {
      res.redirect('/rides');
        }).catch((err) => {
          console.log(err.message);
        })
  })

  // edit page
  app.get('/rides/view/:id/edit', (req, res) => {
    var currentUser = req.user;
    if (currentUser) {
      Ride.findById(req.params.id, function(err, ride) {
        let userIsAuthor;
        console.log(currentUser._id);
        console.log(ride.author._id)
        userIsAuthor = (currentUser._id == ride.author._id);
        if (userIsAuthor) {
          res.render('rides-edit', { ride: ride, currentUser });
        } else {
          console.log('failed authentication on edit! Wrong user');
          return res.status(401); // UNAUTHORIZED
        }
      });
    } else {
      console.log('failed authentication on edit! Not logged in');
      return res.status(401); // UNAUTHORIZED
    }
  });


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

    app.get('/', (req, res) => {
        var currentUser = req.user;
        res.render('home', {currentUser})
    })


  app.get('/rides/new', (req, res) => {
    const currentUser = req.user;
    if (currentUser) {
      res.render('rides-new', { currentUser });
    } else {
      res.redirect('/login');
    }
  });

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
          var token = jwt.sign({ _id: user._id, username: user.username, hasCar: user.hasCar }, process.env.SECRET, { expiresIn: "60 days" });
          res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
          res.redirect('/rides');
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
        User.findOne({ username }, "username password hasCar")
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
                    const token = jwt.sign({ _id: user._id, username: user.username, hasCar: user.hasCar }, process.env.SECRET, {
                        expiresIn: "60 days"
                    });
                    // Set a cookie and redirect to root
                    res.cookie("nToken", token, { maxAge: 900000, httpOnly: true });
                    res.redirect('/rides');
                });
            })
            .catch(err => {
                console.log(err);
            });
    });
}
