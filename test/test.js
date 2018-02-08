const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const calculator = require('../helper/priceCalc.js');
const db = require('../database/cassandra-db.js');
const server = require('../server/cassandra-app.js');
// const request = require('jest');
const Router = require('koa-router');
const supertest = require('supertest');
const expect = require('chai').expect;


const app = new Koa();
const router = new Router(); 
router.use(bodyParser());
app.use(router.routes());

const request = supertest.agent(app.listen());


  // describe('GET /', function () {
  //   it('should return the content of index.html', function (done) {
  //     // just assume that if it contains an <input> tag its index.html
  //     console.log('test input: ', /<input/);
  //     request
  //       .get('/')
  //       .expect(200, /<input/, done);
  //   });
  // });
describe('Get Distance between 2 cooridnates ', function () {
  it('should return the distance between two coordinates', async () => {
    var distance = await calculator.getDistanceFromLatLonInKm(
      37.788164, -122.508212, 47.732895, -122.425989);
    expect(distance).to.eql(1105.82);    
  });
});

describe('Get available Drivers in Lido' , function() {
  it('Should return available Drivers in Lido', async () => {
    var drivers = await db.getAvailableDriversCount('Lido');
    expect(drivers[0].availabledrivers).to.eql(64);
  });
});

describe('Get average drivers in Dushanbe on Wednesday at 11am', () => {
  it('Should return average drivers in Dushanbe on Wednesday at 11am', async () => {
    var data = await db.getSurgeAndDrivers(3, 66, 'Dushanbe');
    expect(data[0].avg_drivers).to.eql(23);
  });
});

describe('Query for unexisting record', () => {
  it('Should return an empty object for city that does not exist', async () => {
    var data = await db.getSurgeAndDrivers(6, 23, 'Sunnyvale');
    expect(data.length).to.eql(0);
  });
});

describe('It should respond back with a json object', () => {
  it('Should respond back with a json object', () => {

  })
})

describe('It should respond back with a json object', () => {
  it('Should respond back with a json object', async () => {
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
     .expect(200);
  });
});

describe('No drivers available in the city', () => {
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
        expect(Object.keys(res.body.data).length).to(40);
      })
  });
});