var rest = require('restler');

var geocode_url = "http://maps.googleapis.com/maps/api/geocode/json";
var directions_url = "http://maps.googleapis.com/maps/api/directions/json";
var places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

var api_key = "AIzaSyDyf1KaN1qhdF7NLNix51LoLxAWoNtQgp4";

exports.geocode = function(query, callback) {
    var origin_string = "";
    if (query.address) {
        origin_string = "?address=" + query.address;
    } else {
        origin_string = "?latlng=" + query.latlng;
    }
	rest.get(geocode_url + origin_string + "&sensor=false").once('complete', function(result) {
		callback(result);
	});
};

exports.directions = function(origin, destination, callback) {
    rest.get(directions_url + "?origin=" + origin + "&destination=" + destination + "&sensor=false").once("complete", function(result) {
        callback(result);
    });
};

exports.places_nearby = function(coords, type, callback) {
    rest.get(places_url + "?key=" + api_key + "&location=" + coords.lat + "," + coords.lng + "&radius=3000&types=" + type + "&sensor=false").once("complete", function(result) {
        callback(result);
    });
}