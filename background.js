// This will fire a popup on every new tab opened

// background is non-persistent and will scan for important events to listen for
// needs information from a persistent variable as soon as it is installed
// listening event -- runtime.onInstalled
chrome.runtime.onInstalled.addListener(function() {
    // ---> uses storage API to access a specific value
    chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log("The color is green.");
    });

});
