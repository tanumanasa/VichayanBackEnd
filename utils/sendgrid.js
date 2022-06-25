// // const axios = require('axios')
// // exports.sendMail = async function(body){
// //     return new Promise( async function(resolve, reject){
// //         try{
// //             const {data} = await axios({
// //                 url:" https://bija9tkej9.execute-api.us-east-1.amazonaws.com/dev/send-mail",
// //                 method: "Post",
// //                 data: body
// //             })
// //             resolve({success: true, response: data})
// //         }
// //         catch(err){
// //             reject({success: false, response: err})
// //         }
// //     })
// // }

// const sendMail = async (to, body) => {
//   var nodemailer = require("nodemailer");
//   var transporter = nodemailer.createTransport({
//     service: "gmail",
//     port: 587,
//     secure: false,
//     auth: {
//       user: "email.devtest02@gmail.com",
//       pass: "Test123",
//     },
//   });

//   var mailOption = {
//     from: "bikashcutmstudy2019@gmail.com",
//     to: to,
//     subject: "Verify Email",
//     html: body,
//   };

//   transporter.sendMail(mailOption, function (error, info) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log("Email sent to" + info.response);
//     }
//   });
// };

// module.exports = sendMail;

const nodemailer = require("nodemailer");
require("dotenv").config({ path: "./.env" });

const sendGrid = (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 465,
    secure: true,
    auth: {
      user: 'apikey',
      pass: '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',
  }
  });

  const mailOptions = {
    from: 'no-reply@langwayz.games',
    to: options.to,
    subject: options.subject,
    html: options.text,
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = 
{
  sendGrid
};
