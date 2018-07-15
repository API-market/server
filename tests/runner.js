var newman = require('newman')
var request = require('supertest');
const fs = require('fs');

const SQLITE_FILENAME = process.env.SQLITE_FILENAME;

describe('loading express', function () {
  this.timeout(20000);
  var server;
  beforeEach(function () {
    if (fs.existsSync(SQLITE_FILENAME)) {
      fs.unlink(SQLITE_FILENAME, (err) => {
            if (err) throw err;
              console.log(SQLITE_FILENAME + ' was deleted');
      });
    }     
    server = require('../server');
  });
  afterEach(function () {
    server.close();
  });
  it('simple_test', function simpleTest(done) {
      newman.run({
              collection: 'tests/data/simple_test.postman_collection.json',
                  reporters: ['cli']
      }, process.exit);
  });
});
