function loadScript(scriptSrc, loadedCallback) {
  var oHead = document.getElementsByTagName("HEAD")[0];
  var oScript = document.createElement('script');
  oScript.type = 'text/javascript';
  oScript.src = scriptSrc;
  oHead.appendChild(oScript);
  oScript.onload = loadedCallback;
}

// let's load the Google API js and run function GoggleApiLoaded once it is done.
loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyAwuW4NSq2HJ9WpB7gmYimPBXSBRuNGkPI&libraries=places", main);

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
  }
  else{

  } // add else case, if browser supports geolocation and user has denied permission or not
  //see https://codelabs.developers.google.com/codelabs/google-maps-nearby-search-js/#2
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

// document.addEventListener('DOMContentLoaded', function () {
//   main();
// });
var btnRefresh = document.getElementById('refresh').addEventListener("click", main);





