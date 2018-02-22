const cassandra = require('cassandra-driver');
const client = new cassandra.Client({
    contactPoints: ['172.31.4.181'], 
    keyspace: 'test_hist_data'
});
// const client = new cassandra.Client({
//     contactPoints: ['172.17.0.3'], 
//     keyspace: 'test_hist_data'
// });

module.exports = {
  getSurgeAndDrivers: (day, timeInterval, city) => {
    const query = `SELECT * FROM test_hist_data.test_data_with_decimal WHERE 
    day=? AND time_interval=? AND city=?`;
    return client.execute(query, [ day, timeInterval, city ], {prepare: true})
      .then(result => {
        return result.rows;
      })
      .catch(error => {
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
        return null;
      })
  },


  updateHistoricalData: (day, timeInterval, city, avgDrivers, avgSurge) => {
    const query = `INSERT INTO test_hist_data.test_data (day, time_interval, city, 
                   avg_drivers, avg_surge) VALUES (?, ?, ?, ?, ?)`;
    return client.execute(query, [ day, timeInterval, city, avgDrivers, avgSurge ], {prepare: true})
    .then(result => {
        console.log();
      })
      .catch(error => {
        return error;
    })
  },

  getFromSample: (day, timeInterval) => {
    const query = `SELECT * FROM test_hist_data.test_data_with_decimal WHERE 
                   day=? AND time_interval=?`;
    return client.execute(query, [ day, timeInterval ], {prepare: true, fetchSize: 10050})
      .then(result => {
        return result.rows;
      })
      .catch(error => {
        return error;
    })
  } 
}


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

  // getDataForAnInterval: (day, timeInterval) => {
  //   const query = `SELECT * FROM test_hist_data.sample WHERE day=? AND time_interval=? limit 10`;
  //   var obj = {};
  //   return client.stream(query, [ day, timeInterval ], { autoPage: true, prepare: true})
  //     .on('readable', function () {
  //       var row;
  //       while (row = this.read()) {
  //         // console.log(row);
  //         obj[row.city] = {avg_drivers: row.avg_drivers,
  //                          avg_surge: row.avg_surge}
  //       }
  //       console.log('this is the final obj', obj);
  //       return obj;
  //     })
  //     .on('end', function () {
  //       console.log('reached end');
  //     });   
  // },