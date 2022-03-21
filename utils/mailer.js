const mailer = (email, text) => {
  var nodemailer = require("nodemailer");
  var transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: "pallishree.testdev@gmail.com",  //pallishree.testdev@gmail.com psd: Pallishree@121096
      pass: "Pallishree@121096",
    },
  });

  var mailOption = {
    from: "pallishree.testdev@gmail.com",
    to: email,
    subject: "From vichayan website",
    html: `
      <h4>Greetings</h4>,
      <h4>This is your verification otp for vichayan.
      <h2> 
      
      ${text}

      </h2>
      <br>
      
      <br>
      <p>Thank You</p>
      `,
  };

  transporter.sendMail(mailOption, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent to" + info.response);
    }
  });
};

module.exports = mailer;
