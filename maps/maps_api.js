var rest = require('restler');

var geocode_url = "http://maps.googleapis.com/maps/api/geocode/json";
var directions_url = "http://maps.googleapis.com/maps/api/directions/json";
var places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
var distance_matrix_url = "http://maps.googleapis.com/maps/api/distancematrix/json";

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

exports.distance_matrix = function(origins, destinations, callback) {
    var origins_string = "";
    for (var i in origins) {
        origins_string += origins[i].lat + "," + origins[i].lng + "|";
    }
    origins_string = origins_string.substring(0, origins_string.length - 1);
    var destinations_string = "";
    for (var i in destinations) {
        destinations_string += destinations[i].lat + "," + destinations[i].lng + "|";
    }
    destinations_string = destinations_string.substring(0, destinations_string.length - 1);
    rest.get(distance_matrix_url + "?origins=" + origins_string + "&destinations=" + destinations_string + "&sensor=false").once("complete", function(result) {
        callback(result);
    })
}