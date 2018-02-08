var redis = require("redis");
var client = redis.createClient();

client.on('connect', function() {
  // console.log('connected via koa');
}).select(3, function() { 
  // console.log('working on DB3');
  // aggregatedData();
  // availableDriversPerCityData()
});

module.exports = {
  getAvailableDriversInACity: (city) => {
    return new Promise(function(resolve, reject) {
      client.hget('city', city, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  },

  getSurgeAndDrivers: (city, hoursPastMidnight, day) => {
    return new Promise(function(resolve, reject) {
      client.hgetall(`${city}:${day}:${hoursPastMidnight}`, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  } 
}