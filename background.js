// This will fire a popup on every new tab opened
// This will also access the location and query for the nearby 
// restaurants under the user preferences

// background is non-persistent and will scan for important events to listen for
// needs information from a persistent variable as soon as it is installed
// listening event -- runtime.onInstalled
chrome.runtime.onInstalled.addListener(function() {
    // ---> uses storage API to access a specific value
    chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log("The color is green.");
    });

});

function init() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
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
    rankBy: google.maps.places.RankBy.DISTANCE,
    keyword: 'sushi'
    // type: 'restaurant'
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, nearbyCallback);
}

function nearbyCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    console.log("okay!");
    console.log(results);
  }
}


// ---> declarativeContent APi takes actions depending on content of page
    // w/o requiring permission to read page's content
    // adding rules for when to activate the page_action
    // but why do u need to remove rules first???
    // !!! we dont need declarativeContent since we are replacing the whole page on every new tab
    // chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    //   chrome.declarativeContent.onPageChanged.addRules([{
    //     conditions: [new chrome.declarativeContent.PageStateMatcher({
    //       // extension is only available to use on URLs including this string
    //       pageUrl: {hostEquals: 'developer.chrome.com'},
    //     })
    //     ],
    //         actions: [new chrome.declarativeContent.ShowPageAction()]
    //   }]);
    // });