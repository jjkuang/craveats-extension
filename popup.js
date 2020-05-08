// popup should load the recyclerview with background.js results
// 

// reference to the ID changeColor from fragment.html
// let changeColor = document.getElementById('changeColor');

// // gets the color of changeColor element from storage
// // change background color to that color
// // set attribute to that color as well
// chrome.storage.sync.get('color', function(data) {
// 	changeColor.style.backgroundColor = data.color;
// 	changeColor.setAttribute('value', data.color);
// });

// // make changeColor clickable
// // when clicked, the background color of the page to the same color as the button
// // example of programmatic injection -- lets USER control when to invoke script
// changeColor.onclick = function(element) {
// 	let color = element.target.value;
// 	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// 	  chrome.tabs.executeScript(
// 	      tabs[0].id,
// 	      {code: 'document.body.style.backgroundColor = "' + color + '";'});
// 	});
// };

let pos;

function main() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.log(pos);
      getNearbyPlaces(pos);
    });
  } // add else case
}


function getNearbyPlaces(position) {
  let request = {
    location: position,
    rankby: google.maps.places.RankBy.DISTANCE,
    radius: 7500,
    openNow: true,
    type: 'restaurant'
  };

  map = new google.maps.Map(document.getElementById('map'));
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, nearbyCallback);
}


function nearbyCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    console.log(results);
    var coordinates = [];
    for (var i = 0; i < results.length; i++) {
    	coords = {
    		lat: results[i].geometry.location.lat(), 
    		lng: results[i].geometry.location.lng()
    	};
    	coordinates.push(coords);
    }
    calculate_distances(coordinates);
  }
}


function calculate_distances(coordinates) {
	var distances = [];
	for (i = 0; i < coordinates.length; i++) {
		distances.push(haversine_distance(pos.lat,pos.lng,
			coordinates[i].lat,coordinates[i].lng));
	}
	console.log(distances);
}

	
function haversine_distance(lat1, lng1, lat2, lng2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lng2 - lng1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}


document.addEventListener('DOMContentLoaded', function () {
  main();
});