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
let DIETARY_RESTRICTIONS;
function main() {
  chrome.storage.sync.get(['diet'], function(result) {
    DIETARY_RESTRICTIONS = result.diet;
    console.log('diet is' + result.diet);
  })  
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
let options_keyword;
function getNearbyPlaces(position,keyword="") {
  let request = {
    location: position,
    rankBy: google.maps.places.RankBy.DISTANCE,
    openNow: true,
    type: 'restaurant',
    keyword: keyword
  };
  
  options_keyword = keyword;
  map = new google.maps.Map(document.getElementById('map'));
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, nearbyCallback);
}

let allRestaurants;
let optionRestaurants;
function nearbyCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    console.log(results);
    modify_required = options_keyword == "" ? false : true;

    if (options_keyword != "") {
      displayedRestaurants = [];
      optionRestaurants = results;
    } else {
      allRestaurants = results;
    }

    getRandomRestaurants(results,modify_required);
    
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
function getRandomRestaurants(results,modify) { 
  rand_restaurants = [];
  for (var i = 0; i < NUM_RESTAURANTS_DISPLAYED; i++) {
    get_rand(results);
  }

  for (var i = 0; i< NUM_RESTAURANTS_DISPLAYED; i++) {
    if (i < 0) break;
    if (modify) {
      makeDetailsRequest(rand_restaurants[i], modifyDetails);
    } else {
      makeDetailsRequest(rand_restaurants[i], displayRestaurant);
    }
  }
}


// TODO: need something async here/promise?
let recyclerView = document.getElementById('results-recycler-view');
let displayedRestaurants = [];
function displayRestaurant(placeResult, status) {
  console.log(placeResult);
  displayedRestaurants.push(placeResult);

  recyclerItem = document.createElement('div');
  recyclerItem.classList.add('restaurant-item');

  if (status == google.maps.places.PlacesServiceStatus.OK) {

    // CREATE TOP CONTAINER
    let topDiv = document.createElement('div');
    topDiv.classList.add('flex-row-container');
    topDiv.classList.add('top-details-container');
    topDiv.id = 'top-details-container';

    // CREATE LEFT SIDE CONTAINER
    let leftDiv = document.createElement('div');
    leftDiv.classList.add('bottom-details-container');
    leftDiv.id = 'left-details-container';

    // CREATE RIGHT SIDE CONTAINER
    let rightDiv = document.createElement('div');
    rightDiv.classList.add('bottom-details-container');
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
  displayedRestaurants = [];
  for (var i = 0; i < NUM_RESTAURANTS_DISPLAYED; i++) {
    options_keyword == "" ? get_rand(allRestaurants) : get_rand(optionRestaurants);
  }
  console.log(rand_restaurants);
  rand_restaurants.forEach(restaurant => {makeDetailsRequest(restaurant, modifyDetails)});
}


function modifyDetails(restaurant) {
  displayedRestaurants.push(restaurant);
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
  frag.childNodes[0].childNodes[3].childNodes[0].childNodes[0].childNodes[0].textContent = address;
  frag.childNodes[0].childNodes[3].childNodes[0].childNodes[0].href = addressUrl;

  // if currently displayed frag has website content, replace textContent and links or remove links
  if (frag.childNodes[0].childNodes[3].childNodes[1].childNodes[0].hasChildNodes()) {
    if (website) {
      frag.childNodes[0].childNodes[3].childNodes[1].childNodes[0].childNodes[0].textContent = website;
      frag.childNodes[0].childNodes[3].childNodes[1].childNodes[0].title = website;
      frag.childNodes[0].childNodes[3].childNodes[1].childNodes[0].href = website;
    } else {
      frag.childNodes[0].childNodes[3].childNodes[1].childNodes[0].childNodes[0].textContent = 'No website available';
      frag.childNodes[0].childNodes[3].childNodes[1].childNodes[0].removeAttribute('href');
      frag.childNodes[0].childNodes[3].childNodes[1].childNodes[0].removeAttribute('title');
    }
  } else {
    if (website) {
      //create elements to display website if they don't already exist
      let websiteLink = document.createElement('a');
      let websiteUrl = document.createTextNode(website);
      websiteLink.appendChild(websiteUrl);
      websiteLink.title = website;
      websiteLink.href = website;
      websiteLink.target = '_blank';
      websiteLink.classList.add('link-details');
      websiteLink.removeAttribute('textContent')
      //remove the original textcontent that would currently be displaying 'No website available'
      frag.childNodes[0].childNodes[3].childNodes[1].textContent = '';
      frag.childNodes[0].childNodes[3].childNodes[1].appendChild(websiteLink);  
    }      
  }

  let date = new Date();
  today = date.getDay();
  hoursIdx = (today == 0 ? 6 : today-1);
  frag.childNodes[0].childNodes[3].childNodes[2].textContent = hours[hoursIdx];

  recyclerView.appendChild(frag);
}


function rankByRating() {
  ratedRestaurants = allRestaurants.filter(restaurant => restaurant.rating)
                                   .sort((a, b) => a.rating > b.rating ? -1 : 1);
  ratedRestaurants.slice(0,4)
        .forEach(restaurant => {
          makeDetailsRequest(restaurant, modifyDetails);
        });
}


let bookmarkedRestaurants = [];
function checkBookOrUnbook(event) {
  // 1. check target - class is 'bookmark' or 'delete'
  //    a. if 'delete', see 2.a.i
  // 2. check whether we need to add to bookmarks or remove from
  //    a. if we are removing, we need to check whether restaurant is being displayed
  //      i. if not displayed, then we use the index from the 'delete'
  //      ii. if displayed, remove from bookmarks list (both visual and in code),
  //          and add unbookmark-inactive class
  //    b. if we are adding, we add active  class, remove inactive class, and createBookmarkNode
  // for 2.a.ii, we need index from displayedRestaurants as well as from

  let bmEl = event.target;
  let bmIdx;
  let currentlyDisplayed = true;

  if (bmEl.classList.contains('bookmark')) {

    let list = bmEl.parentNode.parentNode.parentNode; // results recycler
    let bmNodeItem = bmEl.parentNode.parentNode; // restaurant-item
    bmIdx = Array.prototype.indexOf.call(list.children, bmNodeItem);

  } else { // contains 'delete'
    let list = Array.from(document.getElementsByClassName('delete'));
    bmIdx = list.indexOf(bmEl);
    
    // check if restaurant is displayed right now
    if (!displayedRestaurants.includes(bookmarkedRestaurants[bmIdx])) {
      
      currentlyDisplayed = false; // not displayed, so go straight to unbookmark
      unbookmark(bookmarkedRestaurants[bmIdx], bmIdx, currentlyDisplayed);
      return;

    } else {
      bmIdx = displayedRestaurants.indexOf(bookmarkedRestaurants[bmIdx]);
    }
    
  }
  
  var bookmarked = bookmarkedRestaurants.includes(displayedRestaurants[bmIdx]);
  if (!bookmarked) {
    bookmark(displayedRestaurants[bmIdx], bmIdx);
  } else {
    unbookmark(displayedRestaurants[bmIdx], bmIdx, currentlyDisplayed);
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
function unbookmark(restaurant, idx, currentlyDisplayed) {
  // remove from list
  // if the item is still in recycler view then change the bookmark icon state back to 'unclicked'

  if (currentlyDisplayed && idx > -1) {
    let uel = document.getElementsByClassName('bookmark')[idx];
    uel.classList.remove('bookmark-icon-active');
    uel.classList.add('bookmark-icon-inactive');
    uel.id = 'bookmark-icon-inactive'; 
  } 

  let idxToBeRemoved = bookmarkedRestaurants.indexOf(restaurant);
  let bookmarksDOM = document.getElementById('favourites-div');
  bookmarksDOM.removeChild(bookmarksDOM.children[idxToBeRemoved]);

  bookmarkedRestaurants.splice(idxToBeRemoved, 1);
}


// creating the nodes for the bookmark items
function createBookmarkNode(restaurant) {
  let bookmarks = document.getElementById('favourites-div');

  let bmItem = document.createElement('div');
  bmItem.classList.add('bookmark-item');

  // includes title, delete button
  let titleDiv = document.createElement('div');
  titleDiv.classList.add('flex-row-container');
  titleDiv.classList.add('faves-title-container');

  // includes the distance, rating
  let topDiv = document.createElement('div');
  topDiv.classList.add('flex-row-container');
  topDiv.classList.add('faves-top-container');

  // include the address (TODO: needs truncate), phone number, website, hours
  let bottomDiv = document.createElement('div');
  bottomDiv.classList.add('faves-bottom-container');

  // CREATE NAME ELEMENT
  let name = document.createElement('h3');
  name.classList.add('details');
  name.classList.add('faves-details');
  name.id = 'faves-name-detail';
  name.textContent = restaurant.name;
  titleDiv.appendChild(name);

  // CREATE DELETE ELEMENT
  let unfave = document.createElement('span');
  unfave.classList.add('delete');
  unfave.classList.add('icon');
  unfave.addEventListener('click', this.checkBookOrUnbook.bind(this), false);
  titleDiv.appendChild(unfave);

  bmItem.appendChild(titleDiv);

  // HR
  let hr = document.createElement('hr');
  hr.classList.add('title-hr');
  hr.classList.add('faves-hr');
  bmItem.appendChild(hr);

  // CREATE RATING ELEMENT
  let rating = document.createElement('span');
  rating.classList.add('details');
  rating.classList.add('faves-details');
  rating.classList.add('rating-icon');
  rating.classList.add('icon');
  rating.id = 'faves-rating-detail';
  rating.textContent = (restaurant.rating ? restaurant.rating : 'N/A');
  topDiv.appendChild(rating);

  // CREATE DISTANCE ELEMENT
  let distance = document.createElement('span');
  distance.classList.add('details');
  distance.classList.add('faves-details');
  distance.classList.add('distance-icon');
  distance.classList.add('icon');
  distance.id = 'faves-distance-detail';
  distance.textContent = `${get_distance(restaurant)} km`;
  topDiv.appendChild(distance);

  // CREATE WEBSITE ELEMENT
  let website = document.createElement('p');
  if (restaurant.website) {
    let websiteLink = document.createElement('a');
    let websiteUrl = document.createTextNode(restaurant.website);
    websiteLink.appendChild(websiteUrl);
    websiteLink.title = restaurant.website;
    websiteLink.href = restaurant.website;
    websiteLink.target = '_blank';
    websiteLink.classList.add('link-details');
    website.appendChild(websiteLink);        
  } else {
    website.textContent = 'No website available';
  }
  website.classList.add('details');
  website.classList.add('faves-details');
  website.id = 'faves-website-detail';
  bottomDiv.appendChild(website);

  // CREATE ADDRESS ELEMENT
  let address = document.createElement('p');
  let addressLink = document.createElement('a');
  let addressURL = document.createTextNode(restaurant.formatted_address);
  addressLink.appendChild(addressURL);
  addressLink.href = restaurant.url;
  addressLink.target = '_blank';
  addressLink.classList.add('link-details');
  address.classList.add('details');
  address.classList.add('faves-details');
  address.id = 'faves-address-detail';
  address.appendChild(addressLink);
  bottomDiv.appendChild(address);

  // CREATE PHONE NUM ELEMENT
  let phoneNum = document.createElement('p');
  phoneNum.textContent = (restaurant.formatted_phone_number ? restaurant.formatted_phone_number: 'No phone number available');
  phoneNum.classList.add('details');
  phoneNum.classList.add('faves-details');
  phoneNum.id = 'phone-num-detail';
  bottomDiv.appendChild(phoneNum);  

  // CREATE OPENING HOURS ELEMENT
  let hoursOfDay = document.createElement('p');
  let date = new Date();
  today = date.getDay();
  hoursIdx = (today == 0 ? 6 : today-1);
  hoursOfDay.textContent = restaurant.opening_hours.weekday_text[hoursIdx];
  hoursOfDay.classList.add('details');
  hoursOfDay.classList.add('faves-details');
  hoursOfDay.id = 'hours-detail';
  bottomDiv.appendChild(hoursOfDay);

  bmItem.appendChild(topDiv);
  bmItem.appendChild(bottomDiv);

  bookmarks.appendChild(bmItem);
}


// checks if the chosen restaurant is already in the array
function in_array(array, el) {
   for(var i = 0 ; i < array.length; i++) 
       if(array[i].place_id == el.place_id) return true;
   return false;
}


// pick a random restaurant from results w/o duplicating
// TODO: different types of restaurant objects in these arrays!!!
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

function configure_other_option(option_btn, keyword) {
  if (options_keyword == keyword) {
    option_btn.classList.remove('optionbtn-clicked');
    option_btn.classList.add('optionbtn')
    options_keyword = ""
    getRandomRestaurants(allRestaurants,true);
  } else {
    current_btn = document.getElementsByClassName('optionbtn-clicked');
    console.log(current_btn);
    if (current_btn.length != 0) {
      current_btn = current_btn[0].closest('button');
      current_btn.classList.remove('optionbtn-clicked');
      current_btn.classList.add('optionbtn');
    }
    console.log(current_btn);
    option_btn.classList.remove('optionbtn');
    option_btn.classList.add('optionbtn-clicked');
    getNearbyPlaces(pos,keyword);
  }
}

var refreshButton = document.getElementById('refresh');
refreshButton.addEventListener("click", refresh);

// function handleRefreshUI() {
//   refresh();
// }

var clickableButtons = document.getElementsByClassName('clickable-buttons');
for (var i = 0; i < clickableButtons.length; i++) {
  clickableButtons[i].addEventListener('click', disableAllButtons);
}

function disableAllButtons() {
  for (var i = 0; i < clickableButtons.length; i++) {
    clickableButtons[i].disabled = true;
    setTimeout(enableAllButtons, 1500);
  }
}

function enableAllButtons() {
  for (var i = 0; i < clickableButtons.length; i++) {
    clickableButtons[i].disabled = false;
  }
}

function enableSpanClick() {
  var unclickableSpans = document.getElementsByClassName('unclickable-span');
  while (unclickableSpans.length) {
    unclickableSpans[0].classList.add('clickable-span');
    unclickableSpans[0].classList.remove('unclickable-span');
  }
}

var clickableSpans = document.getElementsByClassName('clickable-span');
for (var i = 0; i < clickableSpans.length; i++) {
  clickableSpans[i].addEventListener('click', event => {
    while (clickableSpans.length) {
      clickableSpans[0].classList.add('unclickable-span');
      clickableSpans[0].classList.remove('clickable-span');
    }
    setTimeout(enableSpanClick, 1500);
  });
}

var distanceSpan = document.getElementById('distance-sort');
distanceSpan.addEventListener("click", () => {
          allRestaurants.slice(0,4).forEach(restaurant => {
            makeDetailsRequest(restaurant, modifyDetails);
          });         
        });

var ratingSpan = document.getElementById('rating-sort');
ratingSpan.addEventListener("click", rankByRating);


var option_btns = document.getElementsByClassName('optionbtn');

for (var i = 0; i < option_btns.length; i++) {
  option_btns[i].addEventListener('click', event => {
    option_btn = event.target.closest("button");
    console.log(option_btn.innerText);
    keyword = option_btn.innerText;
    configure_other_option(option_btn,keyword);
  });
};

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    var storageChange = changes[key];
    DIETARY_RESTRICTIONS = storageChange.newValue;
    location.reload();
  }
})