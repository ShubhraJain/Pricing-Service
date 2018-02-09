var helpers = require("./worker.js");
var CronJob = require('cron').CronJob;
var db = require('../database/cassandra-db.js');
const queueUrl = 'https://sqs.us-west-1.amazonaws.com/344911669843/historical_data';


new CronJob('* * * * * *', async () => {
  console.log('Cron job in progress');
  var data = await helpers.receiveMessage(queueUrl);
  if (data.hasOwnProperty('Messages')) {
    for (var i = 0; i < data.Messages.length; i++) {
      var day = JSON.parse(data.Messages[i].Body).day;
      var timeInterval = JSON.parse(data.Messages[i].Body).timeInterval;
      var city = JSON.parse(data.Messages[i].Body).city;
      var avgDrivers = JSON.parse(data.Messages[i].Body).avgDrivers;
      var avgSurge = JSON.parse(data.Messages[i].Body).avgSurge;
      console.log([day, timeInterval, city, avgDrivers, avgSurge])
      db.updateHistoricalData( day, timeInterval, city, avgDrivers, avgSurge);
      await helpers.deleteMessage(queueUrl, data.Messages[i].ReceiptHandle);
    }
  }
}, null, true, 'America/Los_Angeles');
