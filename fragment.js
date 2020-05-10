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
// UNCOMMENT AFTER THIS

// work added May 7


function main() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
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
    rankBy: google.maps.places.RankBy.DISTANCE,
    keyword: 'sushi',
    type:'restaurant'
  };

  // const places = new google.maps.Map(document.getElementById('map'), {
  //           center: position,
  //           zoom: 15
  //         });

  // service = new google.maps.places.PlacesService(places);
  // service.nearbySearch(request, nearbyCallback);
  const places = document.getElementById('places');
  service = new google.maps.places.PlacesService(places);
  //service.nearbySearch(request, nearbyCallback);
  service.nearbySearch(request, callback);
}

const results = [];

// function nearbyCallback(results, status) {
//   if (status == google.maps.places.PlacesServiceStatus.OK) {
//     console.log("okay!");
//     console.log(results);
//   }
// }

const callback = (response, status, pagination) => {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        results.push(...response);
        console.log("okay");
        console.log(results)
    }

    if (pagination.hasNextPage) {
        setTimeout(() => pagination.nextPage(), 2000);
    } else {
        displayResults();
    }
}

const displayResults = () => {
    results.filter(result => result.rating)
            .sort((a, b) => a.rating > b.rating ? -1 : 1)
     results.slice(0,3)
            .forEach(result => {
                places.innerHTML += `<li>${result.name} - ${result.rating}</li>`;
            });
}

document.addEventListener('DOMContentLoaded', function () {
  main();
});
var btnRefresh = document.getElementById('refresh').addEventListener("click", main);
// displayResults();
// console.log(results);




