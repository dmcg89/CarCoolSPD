/**
* Based on some code by Jayce Azuza to separate nodemailer into a function
 */

const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.EMAIL_DOMAIN,
  },
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

const sendWelcomeEmail = (user) => {
  nodemailerMailgun.sendMail({
    from: 'no-reply@carcool.com',
    to: user.email, // An array if you have multiple recipients.
    subject: 'Thank you for signing up for CarCool!',
    html: (`
    <h2>Welcome ${user.username} to CarCool!</h2>
    <p>If you have not done so, download the app in the app store and begin to carpooling!</p>
    `),
  }).then((info) => {
    console.log(`Response: ${info}`);
  }).catch((err) => {
    console.log(err);
  });
};

const sendAuthRiderJoinedEmail = (user, author) => {
  nodemailerMailgun.sendMail({
    from: 'no-reply@carcool.com',
    to: author.email, // An array if you have multiple recipients.
    subject: 'Someone would like to join your ride!',
    html: (`
    <h2>Welcome ${author.username} to CarCool!</h2>
    <p>This email is to let you know ${user.username} would like to join your ride!</p>
    <p>Please log into the app to view their profile and accept/deline ${user.username}</p>
    `),
  }).then((info) => {
    console.log(`Response: ${info}`);
  }).catch((err) => {
    console.log(err);
  });
};

const sendRiderJoinedEmail = (user, author) => {
  nodemailerMailgun.sendMail({
    from: 'no-reply@carcool.com',
    to: user.email,
    subject: 'You have asked to join authors ride',
    html: (`
    <h2>Welcome ${user.username} to CarCool!</h2>
    <p>This email is to let you know you have asked to join ${author.username}s would ride!</p>
    <p> A confirmation notification will be sent when ${author.username} accepts you </p>
    `),
  }).then((info) => {
    console.log(`Response: ${info}`);
  }).catch((err) => {
    console.log(err);
  });
};

module.exports = {
  sendWelcomeEmail,
  sendAuthRiderJoinedEmail,
  sendRiderJoinedEmail,
};
