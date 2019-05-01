// const User = require('../models/user');
// // const utils = require('utilies') // generate 8 character string
//
// module.exports = function (app) {
//   app.get('/forgot-password', async (req, res) => {
//     res.render('password-forget')
//   })
//
//   app.post('forget-password', async (req, res) => {
//     // take the email
//
//
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       console.log('wrong stuff user doesnt exist');
//       return res.redirect('/')
//     }
//     // generate token
//     // user.resetToken = utils.randomString(8);
//
//     // set token expiration MOMENT
//     user.resetTokenExp = moment(new Date()).add(30, 'minutes');
//
//     user.save();
//
//       //email them
//       // mailer.sendPasswordReset(req.body.email, user.resetToken);
//
//
//     } catch(err) {
//       console.log('err');
//     }
//     // generate token
//     // set token expiration
//     // add token to user
//   res.redirect('/')
//   });
//
//   app.get('/reset-password', async(req, res) =>{
//     const user = await User.findOne({ resetToken: req.query.resetToken });
//
//     if (!user || user.resetTokenExp < new Date ()) {
//       console.log('token is bupkiss');
//       return res.redirect('/')
//     }
//
//     res.render('passwords-reset-passwords', { user });
//   });
//
//   app.post('/reset-password', async(req, res) =>{
//     const user = User.findOne({ resetToken: req.body.resetToken });
//
//     if (!user || user.resetTokenExp < new Date ()) {
//       console.log('token is bumpkiss');
//       return res.redirect('/')
//     }
//
//     // passed in above renderstatment in { user } hidden field stores id
//     user.password = req.body.password
//     user.resetTokenL: null;
//     user.resetTokenExp: null;
//
//     user.save()
//
//     var token = jwt.sign({ _id: user._id}, process.env.SECRET, { expiresIn: '60 days'});
//     res.cookie('flpToken', token);
//     res.redirect('/');
//   })
// };
