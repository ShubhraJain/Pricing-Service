const db = require('../database/cassandra-db.js');
var AWS = require('aws-sdk');
const path = require('path');
AWS.config.loadFromPath(path.resolve(__dirname, '../config.json'));
const Consumer = require('sqs-consumer');
const queueUrl = 'https://sqs.us-west-1.amazonaws.com/344911669843/historical_data';

// create a SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

module.exports = {
  getMessages: () => {
    const consumerOne = Consumer.create({
      queueUrl: queueUrl,
      batchSize: 10,
      handleMessage: (message, done) => {
        var day = JSON.parse(message.Body).day;
        var timeInterval = JSON.parse(message.Body).timeInterval;
        var city = JSON.parse(message.Body).city;
        var avgDrivers = JSON.parse(message.Body).avgDrivers;
        var avgSurge = JSON.parse(message.Body).avgSurge;
        db.updateHistoricalData( day, timeInterval, city, avgDrivers, avgSurge);
        done();
      }
    });

    consumerOne.on('error', (err) => {
      console.log(err.message);
    });
    consumerOne.start();
  }
}  

// creates a queue
// var params = {
//   QueueName: 'historical_data',
//   Attributes: {
//     'DelaySeconds': '0',
//     'MessageRetentionPeriod': '345600'
//   }
// };
// sqs.createQueue(params, (err, data) => {
//   if(err) {
//     console.log(err);
//   } else {
//     console.log('created queue successfully');  
//   }
// });

// Receiving a message
// module.exports = {
//   receiveMessage: (queueUrl) => {
//     let params = {
//       QueueUrl: queueUrl, 
//     }
//     return new Promise((resolve, reject) => {
//       sqs.receiveMessage(params, (err, data) => {
//         if (err) {
//           reject(err);
//         } else {
//           console.log('data in queue: ', data)
//           resolve(data);
//         }
//       });
//     });
//   },
//   deleteMessage: (queueUrl, receipt) => {
//     let params = {
//       QueueUrl: queueUrl,
//       ReceiptHandle: receipt
//     }
//     return new Promise((resolve, reject) => {
//       sqs.deleteMessage(params, (err, data) => {
//         if (err) {
//           reject(err);
//         } else {
//           console.log('deleting message');
//           resolve(data);
//         }
//       });
//     });
//   }
// }

