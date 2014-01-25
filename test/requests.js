var request = require('superagent');
var expect = require('expect.js');

describe("HTTP Requests", function() {
    var base_url = "http://localhost:5000";

    describe("GET /", function() {
        it("should return the homepage", function(done) {
            request.get(base_url + "/").end(function(res) {
                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(res.text).to.contain("<title>Meet Me in the Middle</title>");
                done();
            });
        });
    });

    describe("GET /maps", function() {
        it("should look up an exact address and return a single result", function(done) {
            request.get(base_url + "/maps").query({ address : "123 William Street, New York, NY" }).end(function(res) {
                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(res.body).to.exist;
                expect(res.body.results).to.be.an(Array);
                expect(res.body.results).to.have.length(1);
                expect(res.body.status).to.be("OK");
                done();
            });
        });

        it("should return multiple results for a non-exact match", function(done) {
            request.get(base_url + "/maps").query({ address : "123 William" }).end(function(res) {
                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(res.body).to.exist;
                expect(res.body.results).to.be.an(Array);
                expect(res.body.results.length).to.be.above(5);
                expect(res.body.status).to.be("OK");
                done();
            });
        });

        it("should return an empty array and status of ZERO_RESULTS if there are no results", function(done) {
           request.get(base_url + "/maps").query({ address : "123456789 Abcdefgh" }).end(function(res) {
                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(res.body).to.exist;
                expect(res.body.results).to.be.an(Array);
                expect(res.body.results).to.have.length(0);
                expect(res.body.status).to.be("ZERO_RESULTS");
                done();
            }); 
        });
    });

});