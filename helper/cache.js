const db = require('../database/cassandra-db.js');
const CronJob = require('cron').CronJob;
const moment = require('moment');

var timeIntervals = {};

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

var updateTimeIntervalsObject = async () => {
  var timeInt = getTimeInterval();
  var day = getDay();
  // TODO: if current timeinterval === max of the two keys, then delete the smaller key
  if (Object.keys(timeIntervals).length >= 2) {
    console.log('i have 2 time intervals');
    if (timeInt === 0) {
      console.log('deleting 143rd');
      delete timeIntervals[143];
    } else {
      delete timeIntervals[timeInt - 2];
    }
  } else if (Object.keys(timeIntervals).length === 1) {
    console.log('only have 1 time interval');
    var results = await db.getFromSample(day, timeInt + 1);
    var obj = {};
    results.forEach( (row) => {
      obj[row.city] = { avg_drivers: row.avg_drivers, 
                           avg_surge: row.avg_surge }
    });
    timeIntervals[JSON.parse(timeInt + 1)] = obj;
  }
  var results = await db.getFromSample(day, timeInt);
  var obj = {};
  results.forEach( (row) => {
    obj[row.city] = { avg_drivers: row.avg_drivers, 
                         avg_surge: row.avg_surge }
  });
  timeIntervals[JSON.parse(timeInt)] = obj;
}

module.exports = {
  getData: () => {
    return timeIntervals;
  } 
}

new CronJob('10 * * * * *', () => {
  console.log('Cron job in progress: ', Object.keys(timeIntervals));
  updateTimeIntervalsObject();
}, null, true, 'America/Los_Angeles');

