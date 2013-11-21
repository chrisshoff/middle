var rest = require('restler');

var geocode_url = "http://maps.googleapis.com/maps/api/geocode/json";
var directions_url = "http://maps.googleapis.com/maps/api/directions/json";

exports.geocode = function(address, callback) {
	rest.get(geocode_url + "?address=" + address + "&sensor=false").once('complete', function(result) {
		callback(result);
	});
};

exports.directions = function(origin, destination, callback) {
    rest.get(directions_url + "?origin=" + origin + "&destination=" + destination + "&sensor=false").once("complete", function(result) {
        callback(result);
    });
};