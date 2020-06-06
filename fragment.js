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


let allRestaurants;
function nearbyCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    console.log(results);
    getRandomRestaurants(results);
    allRestaurants = results;
  }
}


function makeDetailsRequest(restaurant, funcName) {
  let request = {
    placeId: restaurant.place_id,
    fields: ['name', 'geometry', 'formatted_address', 'formatted_phone_number',
    'website', 'url', 'opening_hours', 'rating', 'price_level']
  };
  
  service.getDetails(request, funcName);
}


// pick 4 random restaurants from the results list
const NUM_RESTAURANTS_DISPLAYED = 4;
var rand_restaurants = [];
function getRandomRestaurants(results) { 
  for (var i = 0; i < NUM_RESTAURANTS_DISPLAYED; i++) {
    get_rand(results);
  }
  console.log(rand_restaurants);

  rand_restaurants.forEach(place => {makeDetailsRequest(place, displayRestaurant)});
}


// need something async here/promise 
let recyclerView = document.getElementById('resultsRecyclerView');
function displayRestaurant(placeResult, status) {
  console.log(placeResult);
  recyclerItem = document.createElement('div');
  recyclerItem.classList.add('restaurant-item');

  if (status == google.maps.places.PlacesServiceStatus.OK) {
    // i have no idea what html elements to actually use
    // TODO: PRICE LEVEL(?)
    // TODO: probably change the class list a bit depending on how we want to style each element

    // CREATE LEFT SIDE CONTAINER
    let leftDiv = document.createElement('div');
    leftDiv.id = 'left-details-container';

    // CREATE RIGHT SIDE CONTAINER
    let rightDiv = document.createElement('div');
    rightDiv.id = 'right-details-container';

    // CREATE NAME ELEMENT
    let name = document.createElement('h1');
    name.classList.add('details');
    name.id = 'name-detail';
    name.textContent = placeResult.name;
    recyclerItem.appendChild(name);

    // HR
    let hr = document.createElement('hr');
    hr.classList.add('title-hr');
    recyclerItem.appendChild(hr);

    // CREATE RATING ELEMENT
    let rating = document.createElement('p');
    rating.classList.add('details');
    rating.id = 'rating-detail';
    rating.textContent = (placeResult.rating ? `Rating: ${placeResult.rating}` : 'Rating: N/A');
    leftDiv.appendChild(rating);

    // CREATE DISTANCE ELEMENT
    let distance = document.createElement('p');
    distance.classList.add('details');
    distance.id = 'distance-detail';
    distance.textContent = `${get_distance(placeResult)} km`;
    leftDiv.appendChild(distance);

    // CREATE PHONE NUM ELEMENT
    let phoneNum = document.createElement('p');
    phoneNum.textContent = (placeResult.formatted_phone_number ? placeResult.formatted_phone_number: 'No phone number available');
    phoneNum.classList.add('details');
    phoneNum.id = 'phone-num-detail';
    leftDiv.appendChild(phoneNum);  

    // CREATE ADDRESS ELEMENT
    let address = document.createElement('p');
    let addressLink = document.createElement('a');
    let addressURL = document.createTextNode(placeResult.formatted_address);
    addressLink.appendChild(addressURL);
    addressLink.href = placeResult.url;
    addressLink.target = '_blank';
    address.classList.add('details');
    address.id = 'address-detail';
    address.appendChild(addressLink);
    rightDiv.appendChild(address);

    // CREATE WEBSITE ELEMENT
    let websitePara = document.createElement('p');
    if (placeResult.website) {
      let websiteLink = document.createElement('a');
      let websiteUrl = document.createTextNode(placeResult.website);
      websiteLink.appendChild(websiteUrl);
      websiteLink.title = placeResult.website;
      websiteLink.href = placeResult.website;
      websiteLink.target = '_blank';
      websitePara.appendChild(websiteLink);        
    } else {
      websitePara.textContent = 'No website available';
    }
    websitePara.classList.add('details');
    websitePara.id = 'website-detail';
    rightDiv.appendChild(websitePara);

    // CREATE OPENING HOURS ELEMENT
    // only get the hours for the current day
    // just get weekday_text. 0-6, 0 is monday
    // getDay() returns 0-6, 0 is sunday
    let hoursOfDay = document.createElement('p');
    let date = new Date();
    today = date.getDay();
    hoursIdx = (today == 0 ? 6 : today-1);
    hoursOfDay.textContent = placeResult.opening_hours.weekday_text[hoursIdx];
    hoursOfDay.classList.add('details');
    hoursOfDay.id = 'hours-detail';
    rightDiv.appendChild(hoursOfDay);

    recyclerItem.appendChild(leftDiv);
    recyclerItem.appendChild(rightDiv);
  }
  recyclerView.appendChild(recyclerItem);
}


// the allRestaurants array gives us order by distance 
function rankByDistance(restaurant) {
  let frag = document.createDocumentFragment();

  // extract the recycler item div by class into frag
  frag.appendChild(document.getElementsByClassName('restaurant-item')[0]);
  let name = restaurant.name;
  let rating = (restaurant.rating ? `Rating: ${restaurant.rating}` : 'Rating: N/A');
  let distance = `${get_distance(restaurant)} km`;
  let num = (restaurant.formatted_phone_number ? restaurant.formatted_phone_number: 'No phone number available');
  let address = restaurant.formatted_address;
  let addressUrl = restaurant.url;
  let website = restaurant.website;
  let hours = restaurant.opening_hours.weekday_text;

  // modify the details
  frag.childNodes[0].childNodes[0].textContent = name;
  frag.childNodes[0].childNodes[2].childNodes[0].textContent = rating;
  frag.childNodes[0].childNodes[2].childNodes[1].textContent = distance;  
  frag.childNodes[0].childNodes[2].childNodes[2].textContent = num;
  frag.childNodes[0].childNodes[3].childNodes[0].childNodes[0].childNodes[0] = address;
  frag.childNodes[0].childNodes[3].childNodes[0].childNodes[0].href = addressUrl;
  if (frag.childNodes[0].childNodes[3].childNodes[1].childNodes[0].hasChildNodes()) {
    frag.childNodes[0].childNodes[3].childNodes[1].childNodes[0].childNodes[0].textContent = website;
    frag.childNodes[0].childNodes[3].childNodes[1].childNodes[0].title = website;
    frag.childNodes[0].childNodes[3].childNodes[1].childNodes[0].href = website;
  } else {
    frag.childNodes[0].childNodes[3].childNodes[1].textContent = 'No website available';
    
  }
  let date = new Date();
  today = date.getDay();
  hoursIdx = (today == 0 ? 6 : today-1);
  frag.childNodes[0].childNodes[3].childNodes[2] = hours[hoursIdx];

  document.getElementById('resultsRecyclerView').appendChild(frag);
}


function rankByRating() {
  ratedRestaurants = allRestaurants.filter(restaurant => restaurant.rating)
                                   .sort((a, b) => a.rating > b.rating ? -1 : 1);
  ratedRestaurants.slice(0,4)
        .forEach(restaurant => {
          makeDetailsRequest(restaurant, rankByDistance);
        });
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


function get_distance(restaurant) {
  let coords = {
    lat: restaurant.geometry.location.lat(), 
    lng: restaurant.geometry.location.lng()
  };

  return haversine_distance(pos.lat,pos.lng,coords.lat,coords.lng);
}

// straight line distance in km between two points on a spheroid 
// approximating earth as a sphere  
function haversine_distance(lat1, lng1, lat2, lng2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lng2 - lng1) * p))/2;

  var haversine_distance = 12742 * Math.asin(Math.sqrt(a));

  return haversine_distance.toFixed(2); // 2 * R; R = 6371 km
}


document.getElementById('refresh').addEventListener("click", main);
document.getElementById('distance-sort')
        .addEventListener("click", () => {
          allRestaurants.slice(0,4).forEach(restaurant => {
            makeDetailsRequest(restaurant, rankByDistance);
          });
        });
document.getElementById('rating-sort')
        .addEventListener("click", rankByRating);





