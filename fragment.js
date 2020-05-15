// a substitute for the inline script that loads Google Maps API
function loadScript(scriptSrc, loadedCallback) {
  var oHead = document.getElementsByTagName("HEAD")[0];
  var oScript = document.createElement('script');
  oScript.type = 'text/javascript';
  oScript.src = scriptSrc;
  oHead.appendChild(oScript);
  oScript.onload = loadedCallback; 
}

// let's load the Google API js and run function main once it is done.
loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyAwuW4NSq2HJ9WpB7gmYimPBXSBRuNGkPI&libraries=places", 
          main);


let pos;
function main() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      getNearbyPlaces(pos);
    });
  } else {

  } // add else case, if browser supports geolocation and user has denied permission or not
  //see https://codelabs.developers.google.com/codelabs/google-maps-nearby-search-js/#2
}

let service;
function getNearbyPlaces(position) {
  let request = {
    location: position,
    rankBy: google.maps.places.RankBy.DISTANCE,
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
    getRandomRestaurants(results);

    // get coords to calculate distance from location
    // TODO: refactor into separate fxn
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


// pick 4 random restaurants from the results list
const NUM_RESTAURANTS_DISPLAYED = 4;
var rand_restaurants = [];
function getRandomRestaurants(results) { 
  for (var i = 0; i < NUM_RESTAURANTS_DISPLAYED; i++) {
    get_rand(results);
  }
  console.log(rand_restaurants);

  // make the place details request for each restaurant to be displayed
  rand_restaurants.forEach(place => {
    let request = {
      placeId: place.place_id,
      fields: ['name', 'formatted_address', 'formatted_phone_number',
      'website', 'opening_hours', 'rating', 'price_level']
    };
    
    service.getDetails(request, displayRestaurant);
  })
}


let recyclerView;
function displayRestaurant(placeResult, status) {
  recyclerView = document.getElementById('resultsRecyclerView');

  if (status == google.maps.places.PlacesServiceStatus.OK) {
    // i have no idea what html elements to actually use
    // let results = document.createElement('p');
    // TODO: PHONE NUMBER, DISTANCE (OUR OWN FUNCTION), OPENING HOURS, PRICE LEVEL(?)

    // CREATE NAME ELEMENT
    let name = document.createElement('h1');
    name.classList.add('place');
    name.textContent = placeResult.name;
    recyclerView.appendChild(name);

    // CREATE RATING ELEMENT
    if (placeResult.rating) {
      let rating = document.createElement('p');
      rating.classList.add('details');
      rating.textContent = `Rating: ${placeResult.rating}`;
      recyclerView.appendChild(rating);
    }

    // CREATE ADDRESS ELEMENT
    let address = document.createElement('p');
    address.classList.add('details');
    address.textContent = placeResult.formatted_address;
    recyclerView.appendChild(address);

    // CREATE WEBSITE ELEMENT
    let websitePara = document.createElement('p');
    if (placeResult.website) {
      let websiteLink = document.createElement('a');
      let websiteUrl = document.createTextNode(placeResult.website);
      websiteLink.appendChild(websiteUrl);
      websiteLink.title = placeResult.website;
      websiteLink.href = placeResult.website;
      websitePara.appendChild(websiteLink);        
    } else {
      websitePara.textContent = 'No website available';
    }
    recyclerView.appendChild(websitePara);

  }
}


// checks if the chosen restaurant is already in the array
// TODO: eventually with the refresh fxn we need to reset the rand_restaurants
function in_array(array, el) {
   for(var i = 0 ; i < array.length; i++) 
       if(array[i] == el) return true;
   return false;
}


// pick a random restaurant from results w/o duplicating
function get_rand(array) {  
    var rand = array[Math.floor(Math.random()*array.length)];
    if(!in_array(rand_restaurants, rand)) {
       rand_restaurants.push(rand); 
       return rand;
    }
    return get_rand(array);
}


// TODO: wondering if we could add the distances field to the results object
function calculate_distances(coordinates) {
  var distances = [];
  for (i = 0; i < coordinates.length; i++) {
    distances.push(haversine_distance(pos.lat,pos.lng,
      coordinates[i].lat,coordinates[i].lng));
  }
}


// straight line distance between two points on a spheroid 
// approximating earth as a sphere  
function haversine_distance(lat1, lng1, lat2, lng2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lng2 - lng1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}


var btnRefresh = document.getElementById('refresh').addEventListener("click", main);





