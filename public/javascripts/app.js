function ClientApp() {
	var currentTimeout = null;
	
	// Stores all potential coordinates, based on what the user searched for
	var latLongs = {
		location_1 : [],
		location_2 : []
	};

	var selectedLatLongs = {}; // Keep track of what the user selected for our/their locations
	var markers = []; // Stores all place result markers on the map

	// Starting position of the map
	var mapOptions = {
		center: new google.maps.LatLng(-34.397, 150.644),
		zoom: 12
	};
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

	initEvents();
	getMyLocation($("#location_1 .my_location"));

	function initEvents() {

		// Prevent default on all button clicks
		$("button").click(function(e) {
			e.preventDefault();
		});
		
		// Auto-query Google Maps API as user types
		$(".location_input").keyup(function(e) {
			var el_map = getElementsMapFor(this);

			unselectLocation(el_map);

			switch (e.which) {
			case 38:
				// Up key - go up in results
				e.preventDefault();
				el_map["results_div"].find('.highlighted').each(function (e) {
					$(this).removeClass('highlighted').prev().addClass('highlighted');
				});
				break;
			case 40:
				// Down key - go down in results
				e.preventDefault();
				el_map["results_div"].find('.highlighted').each(function (e) {
					$(this).removeClass('highlighted').next().addClass('highlighted');
				});
				break;
			case 27:
				// e.stopPropagation();
				// $(results_selector).hide();
				break;
			case 13:
				// Enter key - select the currently highlighted result
				selectLocation(
					el_map, 
					el_map["results_div"].find('.highlighted').text(), 
					latLongs[el_map["identifier"]][el_map["results_div"].find('.highlighted').attr('id')]
				);
				break;
			default:
				// The user is still typing - clear the current timeout and make another request after 200 ms
				window.clearTimeout(currentTimeout);
				currentTimeout = setTimeout(function() {
					$.get("/maps", { address : el_map["input_element"].val() }, function(result) {
						el_map["results_div"].html("");
						latLongs[el_map["identifier"]] = [];
						for (var i in result.results) {
							el_map["results_div"].append("<li id='" + i + "' class='list-group-item'>" + result.results[i].formatted_address + "</li>");
							latLongs[el_map["identifier"]][i] = result.results[i].geometry.location;
						}

						el_map["results_div"].find("li:first").addClass('highlighted');
					})
				}, 200);
			}
		});

		// User clicks on a potential result to select it
		$(".results").on("click", "li", function(e) {
			var el_map = getElementsMapFor(this);
			el_map["results_div"].find('.highlighted').removeClass('highlighted');
			$(this).addClass('highlighted');
			selectLocation(
				el_map,
				el_map["results_div"].find('.highlighted').text(), 
				latLongs[el_map["identifier"]][el_map["results_div"].find('.highlighted').attr('id')]
			);
		});

		// Get the user's location when either of the My Location buttons is clicked
		$(".my_location").click(function(e) {
			getMyLocation($(this));
		});
	}

	function getMyLocation(original_element) {
		original_element.find("span").hide();
		original_element.find(".loading").show();
  		if (navigator.geolocation) {
    		navigator.geolocation.getCurrentPosition(function(position) {
    			var el_map = getElementsMapFor(original_element);
    			$.get("/maps", { latlng : position.coords.latitude+","+position.coords.longitude }, function(result) {
    					original_element.find("span").show();
    					original_element.find(".loading").hide();
    					selectLocation(
    						el_map,
    						result.results[0].formatted_address, 
    						result.results[0].geometry.location
    					);
				});
			});
		}
	}

	function populateResults() {
		$.post("/maps", { latlng : selectedLatLongs, type : "bar" }, function(result) {
			$("#locations_list ul li").remove();
			markers = [];
			for (var i in result.results) {
				//$("#locations_list ul").append("<li class='list-group-item'><div class='distances'>Your Drive: " + result.results[i].distance_matrix.your_distance + " &nbsp;&nbsp; Their Drive: " + result.results[i].distance_matrix.their_distance + "</div><b>" + result.results[i].name + "</b> " + result.results[i].vicinity + "</li>");
				$("#locations_list ul").append("<li class='list-group-item'>" + result.results[i].name + "</li>");

				var marker = createMarker(new google.maps.LatLng(result.results[i].geometry.location.lat, result.results[i].geometry.location.lng),
					result.results[i].name, result.results[i].name + "<br />" + result.results[i].vicinity + "<br />" + result.results[i].distance_matrix.your_distance + "<br />" + result.results[i].distance_matrix.their_distance);
				
				markers.push(marker);
			}

			/*if (result.results.length > 0) {
				$("#locations_list").show();
			} else {
				$("#locations_list").hide();
			}*/
		});
	}

	function createMarker(pos, title, contents) {
	    var marker = new google.maps.Marker({       
	        position: pos, 
	        map: map,
	        title: title      
	    }); 
	    google.maps.event.addListener(marker, 'click', function() { 
	       new google.maps.InfoWindow({
      			content: contents
  			}).open(map, this);
	    }); 
	    return marker;  
	}

	function selectLocation(el_map, selected_text, selected_coords) {
		el_map["input_element"].val(selected_text);
		changeInputState(el_map, true);
		changeButtonState(el_map, true);

		el_map["results_div"].find('li').remove();

		selectedLatLongs[el_map["identifier"]] = selected_coords;
		map.panTo(new google.maps.LatLng(selected_coords.lat, selected_coords.lng));
		var marker = new google.maps.Marker({
				position: new google.maps.LatLng(selected_coords.lat, selected_coords.lng), 
				icon: '/images/' + el_map["identifier"] + '_icon.png',
				map: map,
		});

		if (selectedLatLongs.location_1 && selectedLatLongs.location_2) {
			populateResults();
		}
	}

	function unselectLocation(el_map) {
		el_map["input_element"].parents(".form-group").removeClass("has-success");
		changeButtonState(el_map, false);
	}

	function changeButtonState(el_map, success) {
		var btn_el = el_map["input_element"].parents(".input-group").find(".btn");
		var icon = btn_el.find("span");
		icon.attr("class", "");
		if (success) {
			btn_el.addClass("btn-success");
			icon.attr("class", "fui-check-inverted");
		} else {
			btn_el.removeClass("btn-success");
			icon.attr("class", "fui-radio-checked");
		}
	}

	function changeInputState(el_map, success) {
		if (success) {
			el_map["input_element"].parents('.form-group').addClass('has-success');
		} else {
			el_map["input_element"].parents('.form-group').removeClass('has-success');
		}
	}

	function getElementsMapFor(input_element) {
		var elements_map = {};
		elements_map["parent_column"] = $(input_element).parents(".column");
		elements_map["input_element"] = elements_map["parent_column"].find(".location_input");
		elements_map["results_div"] = elements_map["parent_column"].find('.results');
		elements_map["identifier"] = elements_map["parent_column"].attr('id');
		return elements_map;
	}
}

$(function() {
	new ClientApp();
});