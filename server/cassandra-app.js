require('newrelic');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const calculator = require('../helper/priceCalc.js');
const db = require('../database/cassandra-db.js');
const moment = require('moment');
const AWS = require('aws-sdk');
const dtsApi = require('./DTSApi.js');
const path = require('path');
// const queueUrl = 'https://sqs.us-west-1.amazonaws.com/344911669843/historical_data';
const app = new Koa();
const router = new Router(); 
const getMessages = require('../worker/worker.js');
const cache = require('../helper/cache.js');

var port = process.env.PORT || (process.argv[2] || 3000);
AWS.config.loadFromPath(path.resolve(__dirname, '../config.json'));
router.use(bodyParser());
app.use(router.routes());

port = (typeof port === "number") ? port : 3000;
if (!module.parent) { 
  app.listen(port, function() {
    console.log(`Koa listening on port ${port}`);
  })
}

var getTimeInterval = () => {
  let hoursPastMidnight = moment().format('HH');
  let minutesPassed =  moment().format('mm');
  var timeInterval = hoursPastMidnight * 6;
  if (minutesPassed < 11) {
    timeInterval += 1;
  } else if (minutesPassed > 10 && minutesPassed < 21) {
    timeInterval += 2;
  } else if (minutesPassed > 20 && minutesPassed < 31) {
    timeInterval += 3;
  } else if (minutesPassed > 30 && minutesPassed < 41) {
    timeInterval += 4;
  } else if (minutesPassed > 40 && minutesPassed < 51) {
    timeInterval += 5;
  } else {
    timeInterval += 6;
  }
  return timeInterval;
}

var getDay = () => {
  var day = moment().format('dddd'); 
  if (day === 'Monday') {
    return 1;
  } else if (day === 'Tuesday') {
    return 2;
  } else if (day === 'Wednesday') {
    return 3;
  } else if (day === 'Thursday') {
    return 4;
  } else if (day === 'Friday') {
    return 5;
  } else if (day === 'Saturday') {
    return 6;
  } else if (day === 'Sunday') {
    return 7;
  } 
}



router.post('/price', async(ctx) => {
  // console.time('FULL RESPONSE TIME');
  let priceTimestamp = moment().format('YYYY-MM-DD HH:mm:ssZ');
  var data = ctx.request.body;
  var city = data.city;

  try {
    let timeInterval = getTimeInterval();
    let availablePromise = await db.getAvailableDriversCount(data.city); // from DTS Service
    let day = getDay();
    let availableDrivers, avgDrivers, avgSurge;
    let distance = calculator.getDistanceFromLatLonInKm(data.pickUpLat, data.pickUpLong, 
                                                        data.dropOffLat, data.dropOffLong);
    if ((cache.getData()).hasOwnProperty(JSON.stringify(timeInterval))) {
      allCitiesAtATimeInterval = (cache.getData())[timeInterval];
      avgSurge = parseFloat(allCitiesAtATimeInterval[city].avg_surge);
      avgDrivers = parseInt(allCitiesAtATimeInterval[city].avg_drivers);
      [availableDrivers] = await Promise.all([availablePromise]);
    } else {
      console.log('fetching from db');
      let params = [day, timeInterval, data.city];
      let surgePromise = db.getSurgeAndDrivers(...params);
      [availableDrivers, surgeAndDrivers] = await Promise.all([availablePromise, surgePromise]);
      avgSurge = parseFloat(surgeAndDrivers[0].avg_surge);
      avgDrivers = parseInt(surgeAndDrivers[0].avg_drivers);
    }
    let surge = 1;
    // console.time('DOUBLE PROMISE SPEED');
    //--------------------------------------------------------------------------------------//
    // let availableDrivers = await db.getAvailableDriversCount(data.city); // from DTS Service
    // let availablePromise = dtsApi.getAvailableDrivers(data.city); // from api
    // let avgSurge = timeIntervals[timeInterval][city].avg_surge;
    // let avgDrivers = timeIntervals[timeInterval][city].avg_drivers;
    //--------------------------------------------------------------------------------------//
    // console.timeEnd('DOUBLE PROMISE SPEED');
    // console.time('ALOGRITHM SPEED');
    if (availableDrivers[0].availabledrivers === 0) {
      ctx.status = 200;
      ctx.body = {
        message: 'no drivers available'
      }
    } else {
      let supplyRatio = availableDrivers/avgDrivers;
      if (supplyRatio > 0.7) {
        surge = 1;
      } else if (supplyRatio > 0.5 && supplyRatio <= 0.7) {
        surge = avgSurge;
      } else if (supplyRatio > 0.3 && supplyRatio <= 0.5) {
        avgSurge += avgSurge * .14;
        surge = avgSurge;
        // surge = parseFloat(avgSurge.toFixed(2));
      } else {
        avgSurge += (avgSurge * .23);
        surge = avgSurge;
        // surge = parseFloat(avgSurge.toFixed(2));
      }
      let rideFare = calculator.calculateRidefare(distance) * surge;
      // console.timeEnd('ALOGRITHM SPEED');
      ctx.status = 200;
      // console.timeEnd('FULL RESPONSE TIME');
      ctx.body = {
        price: parseFloat(rideFare.toFixed(2)),
        priceTimestamp: priceTimestamp,
        rideDuration: calculator.rideDuration(distance),
        surgeMultiplier: surge,
        city: data.city
      };
      // send message to event logger queue
      // var message = {
      //   userId: 2461, // will come from user 
      //   surgeMultiplier: surge,
      //   price: parseFloat(rideFare.toFixed(2)),
      //   pickUpLocation: [data.pickUpLat, data.pickUpLong],
      //   dropOffLocation: [data.dropOffLat, data.dropOffLong],
      //   priceTimestamp: priceTimestamp
      // };
      // var message = {
      //   day: 4,
      //   timeInterval: 120,
      //   city: 'seattle',
      //   avgDrivers: 120,
      //   avgSurge: 3.9
      // }
      // sendMessageToQueue(message, queueUrl);
    } 
  }
  catch (err) {
    ctx.status = 400;
    console.log(err)
  }
});

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

// Sending a message to the queue
var sendMessageToQueue = (msgBody, queueUrl) => {
  var params = {
    MessageBody: JSON.stringify(msgBody),
    QueueUrl: queueUrl,
    DelaySeconds: 0
  };
  return new Promise ( (resolve, reject) => {
    sqs.sendMessage(params, function(err, data) {
      if(err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });   
  });
};

// receive messages from queue that event logger microservice sends in
// getMessages.getMessages()

module.exports = app;