const AWS = require("aws-sdk");

const ses = new AWS.SES({ region: "us-east-1" });

const sendEmail = async (to, subject, message) => {
  const params = {
    Source: "bytebenderazi003@gmail.com",
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Text: { Data: message },
        Html: { Data: `<p>${message}</p>` },
      },
    },
  };

  return ses.sendEmail(params).promise();
};

module.exports = sendEmail;
