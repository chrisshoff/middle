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

	$("button").click(function(e) {
		e.preventDefault();
	});
	
	$(".location_input").keyup(function(e) {
		var input_element = $(this);
		var results_div = $(input_element).parents('.column').find('.results');
		var identifier = $(input_element).parents('.column').attr('id');

		unselectLocation(input_element);

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

	$(".my_location").click(function(e) {
		var original_element = $(this);
		original_element.find("span").hide();
		original_element.find(".loading").show();
  		if (navigator.geolocation) {
    		navigator.geolocation.getCurrentPosition(function(position) {
    			var input_element = $(original_element).parents(".column").find(".location_input");
    			var results_div = $(original_element).parents('.column').find('.results');
    			var identifier = $(original_element).parents('.column').attr('id');
    			$.get("/maps", { latlng : position.coords.latitude+","+position.coords.longitude }, function(result) {
    					original_element.find("span").show();
    					original_element.find(".loading").hide();
						input_element.val(result.results[0].formatted_address);
						selectedLatLongs[identifier] = result.results[0].geometry.location;
						input_element.parents('.form-group').addClass('has-success')
						original_element.addClass("btn-success");
						var icon = original_element.find("span");
						icon.attr("class", "");
						icon.attr("class", "fui-check-inverted");
						results_div.find('li').remove();

						map.panTo(new google.maps.LatLng(selectedLatLongs[identifier].lat, selectedLatLongs[identifier].lng));
						var marker = new google.maps.Marker({
  							position: new google.maps.LatLng(selectedLatLongs[identifier].lat, selectedLatLongs[identifier].lng), 
  							icon: '/images/' + identifier + '_icon.png',
  							map: map,
						});

						if (selectedLatLongs.location_1 && selectedLatLongs.location_2) {
							populateResults();
						}
				});
			});
		}
	});

	function populateResults() {
		//$.post("/maps", { latlng : selectedLatLongs, type : $("input[name='type_of_place']:checked").val() }, function(result) {
		$.post("/maps", { latlng : selectedLatLongs, type : "bar" }, function(result) {
			$("#locations_list ul li").remove();
			for (var i in result.results) {
				//$("#locations_list ul").append("<li class='list-group-item'><div class='distances'>Your Drive: " + result.results[i].distance_matrix.your_distance + " &nbsp;&nbsp; Their Drive: " + result.results[i].distance_matrix.their_distance + "</div><b>" + result.results[i].name + "</b> " + result.results[i].vicinity + "</li>");
				$("#locations_list ul").append("<li class='list-group-item'>" + result.results[i].name + "</li>");
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(result.results[i].geometry.location.lat, result.results[i].geometry.location.lng), 
					map: map
				});
			}

			if (result.results.length > 0) {
				$("#locations_list").show();
			} else {
				$("#locations_list").hide();
			}
		});
	}

	function selectLocation(input_element, results_div) {
		var identifier = $(input_element).parents('.column').attr('id');
		input_element.val(results_div.find('.highlighted').text());
		selectedLatLongs[identifier] = latLongs[identifier][results_div.find('.highlighted').attr('id')];
		input_element.parents('.form-group').addClass('has-success')
		results_div.find('li').remove();

		var btn_el = input_element.parents(".input-group").find(".btn");
		btn_el.addClass("btn-success");
		var icon = btn_el.find("span");
		icon.attr("class", "");
		icon.attr("class", "fui-check-inverted");

    	map.panTo(new google.maps.LatLng(selectedLatLongs[identifier].lat, selectedLatLongs[identifier].lng));
    	var marker = new google.maps.Marker({
			position: new google.maps.LatLng(selectedLatLongs[identifier].lat, selectedLatLongs[identifier].lng), 
			map: map,
			icon: '/images/' + identifier + '_icon.png',
		});

		if (selectedLatLongs.location_1 && selectedLatLongs.location_2) {
			populateResults();
		}
	}

	function unselectLocation(input_element) {
		input_element.parents(".form-group").removeClass("has-success");
		var btn_el = input_element.parents(".input-group").find(".btn");
		btn_el.removeClass("btn-success");
		var icon = btn_el.find("span");
		icon.attr("class", "");
		icon.attr("class", "fui-radio-checked");
	}
});