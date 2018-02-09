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
// const queueUrl = 'https://sqs.us-west-1.amazonaws.com/344911669843/eventLog';
const queueUrl = 'https://sqs.us-west-1.amazonaws.com/344911669843/historical_data';
const app = new Koa();
const router = new Router(); 

var port = process.env.PORT || (process.argv[2] || 3000);
AWS.config.loadFromPath(path.resolve(__dirname, '../config.json'));
router.use(bodyParser());
app.use(router.routes());

port = (typeof port === "number") ? port : 3000;
if (!module.parent) { 
  app.listen(port, function() {
    console.log(`listening in on port ${port}`);
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

var timeIntervals = {};

// var updateTimeIntervalsObject = async() => {
//   var timeInt = getTimeInterval();
//   var day = getDay();
//   var result = await db.getDataForAnInterval(day, timeInt);
//   var obj = {};
//   console.log('result: ', result);
  // result.forEach( (row) => {
  //   obj[row.city] = { avg_drivers: row.avg_drivers, 
  //                        avg_surge: row.avg_surge }
  // });
  // timeIntervals[timeInt] = obj;
  // console.log(Object.keys(obj).length);
// }

// updateTimeIntervalsObject();

router.post('/price', async(ctx) => {
  // console.time('FULL RESPONSE TIME');
  let priceTimestamp = moment().format('YYYY-MM-DD HH:mm:ssZ');
  var data = ctx.request.body;
  var city = data.city;
  try {
    let timeInterval = getTimeInterval();
    let day = getDay();
    let distance = calculator.getDistanceFromLatLonInKm(data.pickUpLat, data.pickUpLong, 
                                                        data.dropOffLat, data.dropOffLong);
    let surge = 1;
    let params = [day, timeInterval, data.city];
    // console.time('DOUBLE PROMISE SPEED');
    let availablePromise = await db.getAvailableDriversCount(data.city); // from DTS Service
    //------------------------------//
    // let availableDrivers = await db.getAvailableDriversCount(data.city); // from DTS Service
    // let availablePromise = dtsApi.getAvailableDrivers(data.city);
    // let avgSurge = timeIntervals[timeInterval][city].avg_surge;
    // let avgDrivers = timeIntervals[timeInterval][city].avg_drivers;
    //------------------------------//
    let surgePromise = db.getSurgeAndDrivers(...params);
    let [availableDrivers, surgeAndDrivers] = await Promise.all([availablePromise, surgePromise]);
    // console.log(availableDrivers[0].availabledrivers);
    // console.timeEnd('DOUBLE PROMISE SPEED');
    // console.time('ALOGRITHM SPEED');
    let avgSurge = parseFloat(surgeAndDrivers[0].avg_surge);
    let avgDrivers = parseInt(surgeAndDrivers[0].avg_drivers);
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
        surge = parseFloat(avgSurge.toFixed(2));
      } else {
        avgSurge += (avgSurge * .23);
        surge = parseFloat(avgSurge.toFixed(2));
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
      // sendMessage(message, queueUrl);
    } 
  }
  catch (err) {
    ctx.status = 400;
    console.log(err)
  }
});

// var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
// // Sending a message
// var sendMessage = (msgBody, queueUrl) => {
//   var params = {
//     MessageBody: JSON.stringify(msgBody),
//     QueueUrl: queueUrl,
//     DelaySeconds: 0
//   };
//   return new Promise ((resolve, reject) => {
//     sqs.sendMessage(params, function(err, data) {
//       if(err) {
//         reject(err);
//       }
//       else {
//         // console.log('message sent successfully! ', data);
//         resolve(data);
//       }
//     });   
//   });
// };

module.exports = app;