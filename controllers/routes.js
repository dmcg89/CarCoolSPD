const jwt = require('jsonwebtoken');
const {
  sendAuthRiderJoinedEmail,
  sendRiderJoinedEmail,
} = require('../middleware/mailgun-config');

const Ride = require('../models/ride');
const User = require('../models/user');


module.exports = function (app) {
  //  index route with pagination
  app.get('/rides', (req, res) => {
    const currentUser = req.user;
    const currentPage = req.query.page || 1;
    Ride.paginate({}, { limit: 5, offset: (currentPage - 1) * 5 }).then((results) => {
      const pageNumbers = [];
      for (let i = 1; i <= results.pages; i += 1) {
        pageNumbers.push(i);
      }
      res.render('rides-index',
        {
          rides: results.docs,
          pagesCount: results.pages,
          currentPage,
          currentUser,
        });
    });
  });

  // Search updated with pagination
  app.get('/search', (req, res) => {
    const term = new RegExp(req.query.term, 'i');
    const currentPage = req.query.page || 1;

    Ride.paginate({
      $or: [
        { start: term },
        { finish: term },
      ],
    },
    { limit: 5, offset: (currentPage - 1) * 5 }).then((results) => {
      const pageNumbers = [];
      for (let i = 1; i <= results.pages; i += 1) {
        pageNumbers.push(i);
      }
      res.render('rides-index', {
        rides: results.docs,
        pagesCount: results.pages,
        currentPage,
        term: req.query.term,
      });
    });
  });

  // app.get('/users/:id', (req, res) => {
  //   const currentUser = req.user;
  //   User.findById(req.params.id).then((user) => {
  //     res.render('user-show', {
  //       currentUser,
  //       user,
  //     });
  //   }).catch((err) => {
  //     console.log(err.message);
  //   });
  // });

  //  add rider to ride
  app.post('/rides/view/:id/adduser', (req, res) => {
    const currentUser = req.user;
    console.log(req.body);

    Ride.findById(req.params.id).then((ride) => {
      if (currentUser) {
        ride.users.push(currentUser);
        ride.save();
        res.redirect(`/rides/view/${ride._id}`);
        sendAuthRiderJoinedEmail(currentUser, ride.author);
        sendRiderJoinedEmail(currentUser, ride.author);
      } else {
        console.log('user not logged in');
        res.redirect('/login');
      }
    })
      .then(info => {
        console.log(`Response: ${info}`);
      })
      .catch((err) => {
        console.log(err.message);
      });
  });

  // delete user/rider from ride
  app.delete('/rides/view/:id/adduser/:userid', (req, res) => {
    const currentUser = req.user;
    console.log(req.body);
    Ride.findById(req.params.id).then((ride) => {
      console.log('here');
      console.log(currentUser._id);
      console.log(ride.author._id);
      if (currentUser._id == ride.author._id || currentUser._id == req.params.userid) {
        const index = ride.users.indexOf(req.params.userid);
        ride.users.splice(index, 1);
        ride.save()
          .then(ride => {
            res.redirect(`/rides/view/${ride._id}`);
          });
      } else {
        console.log('user is not author');
        res.redirect('/rides');
      }
    }).catch((err) => {
      console.log(err.message);
    });
  });

  // show

  app.get('/rides/view/:id', (req, res) => {
    const currentUser = req.user;
    let userNotInRide = false;
    console.log(currentUser);
    Ride.findById(req.params.id).then((ride) => {
      let userIsAuthor;
      if (currentUser) {
        console.log(currentUser._id);
        console.log(ride.author._id);
        console.log(ride.users);

        userIsAuthor = (currentUser._id == ride.author._id);
        let index = ride.users.indexOf(currentUser._id);
        userNotInRide = (index < 0);
        console.log(userNotInRide)
        console.log(index);
      } else {
        userIsAuthor = false;
      }
      console.log(userIsAuthor);
      const seatsLeft = ride.seats - ride.users.length;
      User.find({
        _id: ride.users
      }).then(riders => {
        console.log(riders)
        res.render('rides-show', { ride, currentUser, userIsAuthor, seatsLeft, riders, userNotInRide })
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
    });
  });

  // edit page
  app.get('/rides/view/:id/edit', (req, res) => {
    const currentUser = req.user;
    if (currentUser) {
      Ride.findById(req.params.id, (err, ride) => {
        const userIsAuthor = (currentUser._id === ride.author._id);
        if (userIsAuthor) {
          res.render('rides-edit', {
            ride,
            currentUser,
          });
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

  app.post('/rides/view', (req, res) => {
    console.log(req.user);
    const ride = new Ride(req.body);
    if (req.user) {
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
          res.redirect(`/rides/view/${ride._id}`);
        })
        .catch(err => {
          console.log('failed!');
          console.log(err.message);
        });
    } else {
      console.log('failed authentication!');
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
      });
  });


  // home
  app.get('/', (req, res) => {
    const currentUser = req.user;
    res.render('home', {
      currentUser,
    });
  });


  app.get('/rides/new', (req, res) => {
    const currentUser = req.user;
    if (currentUser) {
      res.render('rides-new', {
        currentUser,
      });
    } else {
      res.redirect('/login');
    }
  });
};
