var helpers = require("./worker.js");
var CronJob = require('cron').CronJob;
var db = require('../database/cassandra-db.js');
const queueUrl = 'https://sqs.us-west-1.amazonaws.com/344911669843/historical_data';


new CronJob('1 * * * * *', async () => {
  console.log('Cron job in progress');
  var data = await helpers.receiveMessage(queueUrl);
  if (data.hasOwnProperty('Messages')) {
    for (var i = 0; i < data.Messages.length; i++) {
      var userId = JSON.parse(data.Messages[i].Body).userId;
      var surgeMultiplier = JSON.parse(data.Messages[i].Body).surgeMultiplier;
      var pickUpLocation = JSON.parse(data.Messages[i].Body).pickUpLocation;
      var dropOffLocation = JSON.parse(data.Messages[i].Body).dropOffLocation;
      var priceTimestamp = JSON.parse(data.Messages[i].Body).priceTimestamp
      console.log([userId, surgeMultiplier, pickUpLocation, dropOffLocation, priceTimestamp]);
      await helpers.deleteMessage(queueUrl, data.Messages[i].ReceiptHandle);
    }
  }

  // var day = data.day;
  // var timeInterval = data.timeInterval;
  // var city = data.city;
  // var avgDrivers = data.avgDrivers;
  // var avgSurge = data.avgSurge;
  // console.log([day, timeInterval, city, avgDrivers, avgSurge])
  // db.updateHistoricalData( day, timeInterval, city, avgDrivers, avgSurge);

  // TODO: delete the message from queue
}, null, true, 'America/Los_Angeles');
