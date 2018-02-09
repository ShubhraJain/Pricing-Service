const axios = require('axios');

module.exports = {
  getAvailableDrivers: (city) => {
    axios.get(`http://www.mocky.io/v2/5a7ab0d3300000130028ba8a?city=${city}`)
    .then( response => {
      // console.log('DTS response*****************', response);
      // console.log('DTS data*****************', response.data[city]);
      return (response.data[city]);
    })
    .catch( err => {
      console.error('inside catch', err);
    });
  },
}