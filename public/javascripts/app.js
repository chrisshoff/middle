$(function() {
	var currentTimeout = null;
	var latLongs = {
		location_1 : [],
		location_2 : []
	};
	var selectedLatLongs = {};
	
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
		$.post("/maps", selectedLatLongs, function(result) {
			console.log(result);
		});
	});

	function selectLocation(input_element, results_div) {
		var identifier = $(input_element).parents('.column').attr('id');
		input_element.val(results_div.find('.highlighted').text());
		selectedLatLongs[identifier] = latLongs[identifier][results_div.find('.highlighted').attr('id')];
		input_element.parents('.form-group').addClass('has-success').append('<span class="input-icon fui-check-inverted"></span>');
		results_div.find('li').remove();
		console.log(selectedLatLongs);	
	}
});