const User = require('../models/user');

module.exports = function (app) {
  app.get('/users/:id', (req, res) => {
    const currentUser = req.user;
    User.findById(req.params.id).then((user) => {
      res.render('user-show', {
        currentUser,
        user,
      });
    }).catch((err) => {
      console.log(err.message);
    });
  });

  // TODO: User Edit
};
