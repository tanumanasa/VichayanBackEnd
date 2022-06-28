const AWS = require('aws-sdk');

const SES_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
};

const AWS_SES = new AWS.SES(SES_CONFIG);

const sendGrid = (options) => {
    let params = {
      Source: process.env.EMAIL,
      Destination: {
        ToAddresses: [
          options.to
        ],
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: options.text,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: options.subject,
        }
      },
    };
    return AWS_SES.sendEmail(params).promise();
};

module.exports = 
{
  sendGrid
};
