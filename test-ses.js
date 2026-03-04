const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

const ses = new AWS.SES();

const params = {
  Source: "yourverifiedemail@gmail.com",
  Destination: {
    ToAddresses: ["yourverifiedemail@gmail.com"],
  },
  Message: {
    Subject: {
      Data: "Test Email from Complaint System",
    },
    Body: {
      Text: {
        Data: "Hello! This is a test email from AWS SES.",
      },
    },
  },
};
