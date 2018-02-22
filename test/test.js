// const Koa = require('koa');
const calculator = require('../helper/priceCalc.js');
const db = require('../database/cassandra-db.js');
const server = require('../server/cassandra-app.js');
const supertest = require('supertest');
const expect = require('chai').expect;

const request = supertest.agent(server.listen());

describe('Get Distance between 2 cooridnates ', () => {
  it('should return the distance between two coordinates', async () => {
    var distance = await calculator.getDistanceFromLatLonInKm(
      37.788164, -122.508212, 47.732895, -122.425989);
    expect(distance).to.eql(1105.82);    
  });
});

xdescribe('Gets ride duration', () => {
  it('Should return the duration of a ride if distance travelled is 10kms', async () => {
    var duration = await calculator.rideDuration(10);
    expect(duration).to.eql(20);
  });
});

xdescribe('Calculate ride fare for distance less than 1km', () => {
  it('Fare should be 5', async () => {
    var fare = await calculator.calculateRidefare(1);
    expect(fare).to.eql(5)
  });
});

xdescribe('Calculate ride fare for 3km distance', () => {
  it('Fare should be 5', async () => {
    var fare = await calculator.calculateRidefare(3);
    expect(fare).to.eql(11)
  });
});

xdescribe('Calculate ride fare for 6km distance', () => {
  it('Fare should be for 6km', async () => {
    var fare = await calculator.calculateRidefare(6);
    expect(fare).to.eql(15.8)
  });
});

xdescribe('Calculate ride fare for 8km', () => {
  it('Fare should be 8kms', async () => {
    var fare = await calculator.calculateRidefare(8);
    expect(fare).to.eql(18.2)
  });
});

xdescribe('Calculate ride fare for distance of 100km', () => {
  it('Fare should be 125', async () => {
    var fare = await calculator.calculateRidefare(100);
    expect(fare).to.eql(125)
  });
});

xdescribe('Get available Drivers in Lido' , function() {
  it('Should return available Drivers in Lido', async () => {
    var drivers = await db.getAvailableDriversCount('Lido');
    expect(drivers[0].availabledrivers).to.eql(64);
  });
});

xdescribe('Query with wrong data' , function() {
  it('Should return error', async () => {
    var drivers = await db.getAvailableDriversCount(4839);
    expect(drivers).to.eql(null);
  });
});

xdescribe('Get average drivers in Dushanbe on Wednesday at 11am', () => {
  it('Should return average drivers in Dushanbe on Wednesday at 11am', async () => {
    var data = await db.getSurgeAndDrivers(3, 66, 'Dushanbe');
    expect(data[0].avg_drivers).to.eql(23);
  });
});

xdescribe('Get results for bad data', () => {
  it('Should return error', async () => {
    var data = await db.getSurgeAndDrivers(3, 'hello', 'Dushanbe');
    expect(data).to.eql(null);
  });
});

xdescribe('Query for unexisting record', () => {
  it('Should return an empty object for city that does not exist', async () => {
    var data = await db.getSurgeAndDrivers(6, 23, 'Sunnyvale');
    expect(data.length).to.eql(0);
  });
});

xdescribe('It should respond back with a json object', () => {
  it('Should respond back with a json object', () => {

  })
})

xdescribe('It should respond back with a json object', () => {
  it('Should respond back with a json object', () => {
    let body = {
      'city': 'Floreal',
      'pickUpLat': '37.788164',
      'pickUpLong': '-122.508212',
      'dropOffLat': '47.732895',
      'dropOffLong': '-122.425989'
    };

    request
     .post('/price')
     .send(body)
     .end( (err, res) => {
        assert.equal(Object.keys(res.body.data).length, 5);
      })
  });
});

xdescribe('No drivers available in the city', () => {
  it('Should return message of no drivers available', async () => {
    let body = {
      'city': 'Rensselaer',
      'pickUpLat': '37.788164',
      'pickUpLong': '-122.508212',
      'dropOffLat': '47.732895',
      'dropOffLong': '-122.425989'
    }

    request
      .post('/price')
      .send(body)
      .end( (err, res) => {
        assert.equal(res.body.message, 'no drivers available');
      })
  });
});

xdescribe('Bad request', () => {
  it('Should return error if data is bad', async () => {
    let body = {
      "pickUpLat": "37.788164",
      "pickUpLong": "-122.508212",
      "dropOffLat": "47.732895"
    }

    request
      .post('/price')
      .send(body)
      .end( (err, res) => {
        assert.ifError(res.body.message);
      })
  });
});