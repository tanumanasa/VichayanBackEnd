const AWS = require('aws-sdk');

//configuring region for aws 
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2'
});

//configuring parameters 
const sendGrid = (options) => {
  const params = {
      Destination: {
          ToAddresses: [
            options.to
          ]
      },
      Message: {
          Body: {
              Html: {
                  Charset: "UTF-8",
                  Data: options.text,
              }
          },
          Subject: {
              Charset: "UTF-8",
              Data: "Verification OTP"
          }
      },
      Source: process.env.EMAIL,
      ReplyToAddresses: [
          process.env.REPLY_TO
      ],
  };

  console.log(JSON.stringify(params));

  //creating promise for sending Email

  const sendPromise = new AWS.SES({
      apiVersion: '2010-12-01'
  }).sendEmail(params).promise();

  // handling promise when rejected 

  sendPromise.then(
      function(data) {
          console.log(data.MessageId);
      }
  ).catch(
      function(err) {
          console.error(err, err.stack);
      }
  );

}

module.exports = 
{
  sendGrid
};
