// const Koa = require('koa');
// const bodyParser = require('koa-bodyparser');
// const Router = require('koa-router');
const db = require('../database/cassandra-db.js');
var AWS = require('aws-sdk');
const path = require('path');
// const app = new Koa();
// const router = new Router(); 
// const port = process.env.PORT || 3000;
AWS.config.loadFromPath(path.resolve(__dirname, '../config.json'));
// router.use(bodyParser());
// app.use(router.routes());

// app.listen(port, () => {
//   console.log('Koa is listening on port ' + port);
// });

// create a SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

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
module.exports = {
  receiveMessage: (queueUrl) => {
    let params = {
      QueueUrl: queueUrl, 
      VisibilityTimeout: 60
    }
    return new Promise((resolve, reject) => {
      sqs.receiveMessage(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log('data in queue: ', data)
          resolve(data);
        }
      });
    });
  },
  deleteMessage: (queueUrl, receipt) => {
    let params = {
      QueueUrl: queueUrl,
      ReceiptHandle: receipt
    }
    return new Promise((resolve, reject) => {
      sqs.deleteMessage(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log('deleting message');
          resolve(data);
        }
      });
    });
  }
}

