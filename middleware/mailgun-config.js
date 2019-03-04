/**
 * Send email confirmation that the user's account has been created.
 * Created by: Jayce Azua
 * Date: 02/27/2019
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
    from: 'no-reply@ar-hunt.com',
    to: user.email, // An array if you have multiple recipients.
    subject: 'Thank you for signing up for CarCool!',
    html: (`
    <h2>Welcome ${user.username} to CarCool!</h2>
    <p>If you have not done so, download the app in the app store and begin to scavenger!</p>
    `),
  }).then((info) => {
    console.log(`Response: ${info}`);
  }).catch((err) => {
    console.log(err);
  });
};

module.exports = {
  sendWelcomeEmail,
};
