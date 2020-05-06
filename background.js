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