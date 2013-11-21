var maps_api = require('./maps_api');

exports.lookupAddress = function(req, res) {
	maps_api.geocode(req.query.address, function(result) {
		res.json(result);
	});
}

exports.meet = function(req, res) {
    var origin = req.body.location_1.lat + "," + req.body.location_1.lng;
    var destination = req.body.location_2.lat + "," + req.body.location_2.lng;
    maps_api.directions(origin, destination, function(result) {
        // calculate total time
        var total_time = 0;
        var legs = result.routes[0].legs;
        for (var i in legs) {
            for (var j in legs[i].steps) {
                total_time += legs[i].steps[j].duration.value;
            }
        }

        res.json(get_midpoint(total_time, legs));
    });
}

function get_midpoint(total_time, legs) {
    var mid_time = total_time / 2;
    var current_time = 0;
    var time_before_update = 0;
    var done = false;
    var middle_coords = {};
    for (var i in legs) {
        for (var j in legs[i].steps) {
            time_before_update = current_time;
            current_time += legs[i].steps[j].duration.value;
            if (current_time >= mid_time) {
                var time_into_route = mid_time - time_before_update;
                var percent = time_into_route / legs[i].steps[j].duration.value;
                var the_start = legs[i].steps[j].start_location;
                var the_end = legs[i].steps[j].end_location;
                middle_coords["lat"] = the_start.lat + (percent * (the_end.lat - the_start.lat));
                middle_coords["lng"] = the_start.lng + (percent * (the_end.lng - the_start.lng));
                return middle_coords;
            }
        }
    }
}