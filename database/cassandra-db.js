const cassandra = require('cassandra-driver');
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'], 
    keyspace: 'test_hist_data'
});

module.exports = {
  getSurgeAndDrivers: (day, timeInterval, city) => {
    const query = `SELECT * FROM test_hist_data.test_data WHERE 
    day=? AND time_interval=? AND city=?`;
    return client.execute(query, [ day, timeInterval, city ], {prepare: true})
      .then(result => {
        return result.rows;
      })
      .catch(error => {
        // console.log('error inside getSurgeAndDrivers', error);
        return null;
    })
  },

  getAvailableDriversCount: (city) => {
    const query = `SELECT * FROM test_hist_data.test_drivers_count WHERE city=?`;
    return client.execute(query, [ city], { prepare: true })
      .then(result => {
        return result.rows;
      })
      .catch(error => {
        // console.log('error inside getAvailableDriversCount', city + '\n' + error);
        return null;
      })
  },

  // getDataForAnInterval: (day, timeInterval) => {
  //   const query =  `SELECT * FROM test_hist_data.test_data WHERE day=? AND time_interval=?`;
  //   return client.stream(query, [ day, timeInterval ], { autoPage: true, prepare: true, setFetchSize: 10000 }) 
  //     .then(result => {
  //       console.log('fetching rows')
  //       return result.rows;
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     })
  // },

  updateHistoricalData: (day, timeInterval, city, avgDrivers, avgSurge) => {
    const query = `INSERT INTO test_hist_data.test_data (day, time_interval, city, 
                   avg_drivers, avg_surge) VALUES (?, ?, ?, ?, ?)`;
    return client.execute(query, [ day, timeInterval, city, avgDrivers, avgSurge ], {prepare: true});
  }
}