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
    'website', 'url', 'opening_hours', 'rating', 'place_id']
  };
  
  service.getDetails(request, funcName);
}


// pick 3 random restaurants from the results list
const NUM_RESTAURANTS_DISPLAYED = 3;
var rand_restaurants = [];
function getRandomRestaurants(results) { 
  for (var i = 0; i < NUM_RESTAURANTS_DISPLAYED; i++) {
    get_rand(results);
  }

  for (var i = 0; i < NUM_RESTAURANTS_DISPLAYED; i++) {
    makeDetailsRequest(rand_restaurants[i], displayRestaurant);
  }
}


// TODO: need something async here/promise?
let recyclerView = document.getElementById('resultsRecyclerView');
let displayedRestaurants = [];
function displayRestaurant(placeResult, status) {
  console.log(placeResult);
  displayedRestaurants.push(placeResult);

  recyclerItem = document.createElement('div');
  recyclerItem.classList.add('restaurant-item');

  if (status == google.maps.places.PlacesServiceStatus.OK) {
    // i have no idea what html elements to actually use
    // TODO: PRICE LEVEL(?)
    // TODO: probably change the class list a bit depending on how we want to style each element

    // CREATE TOP CONTAINER
    let topDiv = document.createElement('div');
    topDiv.id = 'top-details-container';

    // CREATE LEFT SIDE CONTAINER
    let leftDiv = document.createElement('div');
    leftDiv.id = 'left-details-container';

    // CREATE RIGHT SIDE CONTAINER
    let rightDiv = document.createElement('div');
    rightDiv.id = 'right-details-container';

    // CREATE NAME ELEMENT
    let name = document.createElement('h3');
    name.classList.add('details');
    name.id = 'name-detail';
    name.textContent = placeResult.name;
    topDiv.appendChild(name);

    // CREATE BOOKMARK ELEMENT
    let bookmark = document.createElement('span');
    bookmark.classList.add('bookmark');
    bookmark.classList.add('bookmark-icon-inactive');
    bookmark.id = 'bookmark-icon-inactive';
    bookmark.addEventListener('click', this.checkBookOrUnbook.bind(this), false);
    topDiv.appendChild(bookmark);

    recyclerItem.appendChild(topDiv);

    // HR
    let hr = document.createElement('hr');
    hr.classList.add('title-hr');
    recyclerItem.appendChild(hr);

    // CREATE RATING ELEMENT
    let rating = document.createElement('span');
    rating.classList.add('details');
    rating.classList.add('rating-icon');
    rating.classList.add('icon');
    rating.id = 'rating-detail';
    rating.textContent = (placeResult.rating ? `Rating: ${placeResult.rating}` : 'Rating: N/A');
    leftDiv.appendChild(rating);

    // CREATE DISTANCE ELEMENT
    let distance = document.createElement('span');
    distance.classList.add('details');
    distance.classList.add('distance-icon');
    distance.classList.add('icon');
    distance.id = 'distance-detail';
    distance.textContent = `${get_distance(placeResult)} km`;
    leftDiv.appendChild(distance);

    // CREATE PHONE NUM ELEMENT
    let phoneNum = document.createElement('span');
    phoneNum.textContent = (placeResult.formatted_phone_number ? placeResult.formatted_phone_number: 'No phone number available');
    phoneNum.classList.add('details');
    phoneNum.classList.add('phone-icon');
    phoneNum.classList.add('icon');
    phoneNum.id = 'phone-num-detail';
    leftDiv.appendChild(phoneNum);  

    // CREATE ADDRESS ELEMENT
    let address = document.createElement('span');
    let addressLink = document.createElement('a');
    let addressURL = document.createTextNode(placeResult.formatted_address);
    addressLink.appendChild(addressURL);
    addressLink.href = placeResult.url;
    addressLink.target = '_blank';
    addressLink.classList.add('link-details');
    address.classList.add('details');
    address.classList.add('address-icon');
    address.classList.add('icon');
    address.id = 'address-detail';
    address.appendChild(addressLink);
    rightDiv.appendChild(address);

    // CREATE WEBSITE ELEMENT
    let website = document.createElement('span');
    if (placeResult.website) {
      let websiteLink = document.createElement('a');
      let websiteUrl = document.createTextNode(placeResult.website);
      websiteLink.appendChild(websiteUrl);
      websiteLink.title = placeResult.website;
      websiteLink.href = placeResult.website;
      websiteLink.target = '_blank';
      websiteLink.classList.add('link-details');
      website.appendChild(websiteLink);        
    } else {
      website.textContent = 'No website available';
    }
    website.classList.add('details');
    website.classList.add('website-icon');
    website.classList.add('icon');
    website.id = 'website-detail';
    rightDiv.appendChild(website);

    // CREATE OPENING HOURS ELEMENT
    // only get the hours for the current day
    // just get weekday_text. 0-6, 0 is monday
    // getDay() returns 0-6, 0 is sunday
    let hoursOfDay = document.createElement('span');
    let date = new Date();
    today = date.getDay();
    hoursIdx = (today == 0 ? 6 : today-1);
    hoursOfDay.textContent = placeResult.opening_hours.weekday_text[hoursIdx];
    hoursOfDay.classList.add('details');
    hoursOfDay.classList.add('hours-icon');
    hoursOfDay.classList.add('icon');
    hoursOfDay.id = 'hours-detail';
    rightDiv.appendChild(hoursOfDay);

    recyclerItem.appendChild(leftDiv);
    recyclerItem.appendChild(rightDiv);
  }
  recyclerView.appendChild(recyclerItem);
}

function refresh() {
  rand_restaurants = [];
  for (var i = 0; i < NUM_RESTAURANTS_DISPLAYED; i++) {
    get_rand(allRestaurants);
  }
  console.log(rand_restaurants);
  rand_restaurants.forEach(restaurant => {makeDetailsRequest(restaurant, modifyDetails)});
}


function modifyDetails(restaurant) {
  let frag = document.createDocumentFragment();

  // extract the recycler item div by class into frag
  frag.appendChild(document.getElementsByClassName('restaurant-item')[0]);
  console.log(document.getElementsByClassName('restaurant-item')[0]);
  let name = restaurant.name;
  let rating = (restaurant.rating ? `Rating: ${restaurant.rating}` : 'Rating: N/A');
  let distance = `${get_distance(restaurant)} km`;
  let num = (restaurant.formatted_phone_number ? restaurant.formatted_phone_number: 'No phone number available');
  let address = restaurant.formatted_address;
  let addressUrl = restaurant.url;
  let website = restaurant.website;
  let hours = restaurant.opening_hours.weekday_text;

  // modify the details
  frag.childNodes[0].childNodes[0].childNodes[0].textContent = name;
  if (frag.childNodes[0].childNodes[0].childNodes[1].classList.contains('bookmark-icon-active')) {
    frag.childNodes[0].childNodes[0].childNodes[1].classList.remove('bookmark-icon-active');
    frag.childNodes[0].childNodes[0].childNodes[1].classList.add('bookmark-icon-inactive');
  }
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
          makeDetailsRequest(restaurant, modifyDetails);
        });
}


// checking if any of the objects in the bookmarkedRestaurants are in the rand_restaurants
// before displaying
// need to create individual IDs for each bookmark so that i know the index
let bookmarkedRestaurants = [];
function checkBookOrUnbook(event) {
  // check if the bookmark has been clicked already
  // i.e. is the indexed restaurant from the displayed restaurants already in bookmarks?
  // get index of the bookmark's parent's parent (i.e. restaurant-item) in terms of 
  // resultsRecyclerView array

  let bmEl = event.target;
  let list = bmEl.parentNode.parentNode.parentNode; //bookmark element 
  let bmNodeItem = bmEl.parentNode.parentNode;
  let bmIdx = Array.prototype.indexOf.call(list.children, bmNodeItem);
  
  var bookmarked = bookmarkedRestaurants.includes(displayedRestaurants[bmIdx]);
  if (!bookmarked) {
    bookmark(displayedRestaurants[bmIdx], bmIdx);
  } else {
    unbookmark(displayedRestaurants[bmIdx], bmIdx);
  }

}


function bookmark(restaurant, idx) {
  // need element that it was clicked on
  // need element's PARENT's inner HTML stuff/upper level containers
  // need to change bookmark icon to 'clicked' state (light pink)
  // change background image url and leave it to the hover one

  let bel = document.getElementsByClassName('bookmark')[idx];
  bel.classList.remove('bookmark-icon-inactive');
  bel.classList.add('bookmark-icon-active');
  bel.id = 'bookmark-icon-active';
  bookmarkedRestaurants.push(restaurant);
  createBookmarkNode(restaurant);
}


// there are at least two ways to reach this function:
// 1. click the bookmark again
// 2. click the 'x' on the bookmarked item in the list
function unbookmark(restaurant, idx) {
  // remove from list
  // if the item is still in recycler view then change the bookmark icon state back to 'unclicked'
  let idxToBeRemoved = bookmarkedRestaurants.indexOf(displayedRestaurants[idx]);
  if (idxToBeRemoved > -1) {
    let uel = document.getElementsByClassName('bookmark')[idx];
    uel.classList.remove('bookmark-icon-active');
    uel.classList.add('bookmark-icon-inactive');
    uel.id = 'bookmark-icon-inactive';

    bookmarkedRestaurants.splice(idxToBeRemoved, 1);
  } else {
    // error
  }

}


// creating the nodes for the bookmark items
function createBookmarkNode(restaurant) {
  let bmItem = document.createElement('div');
  let topDiv = document.createElement('div');
  topDiv.classList.add('faves-top-level-container');
  let bottomDiv = document.createElement('div');
  bottomDiv.classList.add('faves-bottom-level-container');

  
}


// checks if the chosen restaurant is already in the array
// TODO: eventually with the refresh fxn we need to reset the rand_restaurants
function in_array(array, el) {
   for(var i = 0 ; i < array.length; i++) 
       if(array[i].place_id == el.place_id) return true;
   return false;
}


// pick a random restaurant from results w/o duplicating
// TODO: different types of restaurant objects in these arrays!!!
// && !in_array(bookmarkedRestaurants, rand)
function get_rand(array) {  
    var rand = array[Math.floor(Math.random()*array.length)];
    if(!in_array(rand_restaurants, rand) && !in_array(bookmarkedRestaurants, rand)) {
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


document.getElementById('refresh').addEventListener("click", refresh);
document.getElementById('distance-sort')
        .addEventListener("click", () => {
          allRestaurants.slice(0,4).forEach(restaurant => {
            makeDetailsRequest(restaurant, modifyDetails);
          });
        });
document.getElementById('rating-sort')
        .addEventListener("click", rankByRating);



