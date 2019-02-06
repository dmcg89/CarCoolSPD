const Ride = require('../models/ride');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

//index

module.exports = function(app, Ride) {
    app.get('/', (req, res) => {
      var currentUser = req.user;
      console.log("this ran");
      console.log(currentUser);
        Ride.find()
        .then(rides => {
            res.render('rides-index', {rides: rides, currentUser});
        })
        .catch(err => {
            console.log(err);
        });
    });

    // show

    app.get('/rides/view/:id', (req, res) => {
        Ride.findById(req.params.id).then((ride) => {
            res.render('rides-show', { ride: ride })
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
        Ride.findById(req.params.id, function(err, ride) {
            res.render('rides-edit', { ride: ride });
        })
    })


    app.post('/rides/view', (req, res) => {
        Ride.create(req.body).then((ride) => {
            console.log(ride);
            res.redirect(`/rides/view/${ride._id}`);
        }).catch((err) => {
            console.log(err.message);
        })
    })


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
        res.render('rides-index', {})
    })


    app.get('/rides/new', (req, res) => {
        res.render('rides-new', {});
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
