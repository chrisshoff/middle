$(function() {
	var currentTimeout = null;
	var latLongs = {
		location_1 : [],
		location_2 : []
	};
	var selectedLatLongs = {};

	var mapOptions = {
		center: new google.maps.LatLng(-34.397, 150.644),
		zoom: 12
	};
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	
	$(".location_input").keyup(function(e) {
		var input_element = $(this);
		var results_div = $(input_element).parents('.column').find('.results');
		var identifier = $(input_element).parents('.column').attr('id');
		switch (e.which) {
		case 38:
			e.preventDefault();
			results_div.find('.highlighted').each(function (e) {
				$(this).removeClass('highlighted').prev().addClass('highlighted');
			});
			break;
		case 40:
			e.preventDefault();
			results_div.find('.highlighted').each(function (e) {
				$(this).removeClass('highlighted').next().addClass('highlighted');
			});
			break;
		case 27:
			// e.stopPropagation();
			// $(results_selector).hide();
			break;
		case 13:
			selectLocation(input_element, results_div);
			break;
		default:
			window.clearTimeout(currentTimeout);
			currentTimeout = setTimeout(function() {
				$.get("/maps", { address : input_element.val() }, function(result) {
					results_div.html("");
					latLongs[identifier] = [];
					for (var i in result.results) {
						results_div.append("<li id='" + i + "' class='list-group-item'>" + result.results[i].formatted_address + "</li>");
						latLongs[identifier][i] = result.results[i].geometry.location;
					}

					results_div.find("li:first").addClass('highlighted');
				})
			}, 200);
		}
	});

	$(".results").on("click", "li", function(e) {
		var input_element = $(this).parents('.column').find('.location_input');
		var results_div = $(input_element).parents('.column').find('.results');
		results_div.find('.highlighted').removeClass('highlighted');
		$(this).addClass('highlighted');
		selectLocation(input_element, results_div);
	});

	$("#meet_btn").click(function(e) {
		$.post("/maps", { latlng : selectedLatLongs, type : $("input[name='type_of_place']:checked").val() }, function(result) {
			$("#locations_list ul li").remove();
			console.log(result);
			for (var i in result.results) {
				$("#locations_list ul").append("<li class='list-group-item'><div class='distances'>Your Drive: " + result.results[i].distance_matrix.your_distance + " &nbsp;&nbsp; Their Drive: " + result.results[i].distance_matrix.their_distance + "</div><b>" + result.results[i].name + "</b> " + result.results[i].vicinity + "</li>");
			}
		});
	});

	$("#my_location").click(function(e) {
  		if (navigator.geolocation) {
    		navigator.geolocation.getCurrentPosition(function(position) {
    			var results_div = $("#results_1");
    			var identifier = "location_1";
    			$.get("/maps", { latlng : position.coords.latitude+","+position.coords.longitude }, function(result) {
						$("#location_input_1").val(result.results[0].formatted_address);
						selectedLatLongs[identifier] = result.results[0].geometry.location;
						$("#location_input_1").parents('.form-group').addClass('has-success')
						$("#location_input_1").after($('<span class="input-icon fui-check-inverted"></span>'));
						results_div.find('li').remove();

						map.panTo(new google.maps.LatLng(selectedLatLongs[identifier].lat, selectedLatLongs[identifier].lng));
				});
			});
		}
	});

	function selectLocation(input_element, results_div) {
		var identifier = $(input_element).parents('.column').attr('id');
		input_element.val(results_div.find('.highlighted').text());
		selectedLatLongs[identifier] = latLongs[identifier][results_div.find('.highlighted').attr('id')];
		input_element.parents('.form-group').addClass('has-success')
		input_element.after($('<span class="input-icon fui-check-inverted"></span>'));
		results_div.find('li').remove();

    	map.panTo(new google.maps.LatLng(selectedLatLongs[identifier].lat, selectedLatLongs[identifier].lng));
	}
});