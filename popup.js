// popup should load the recyclerview with background.js results
// 

// reference to the ID changeColor from fragment.html
let changeColor = document.getElementById('changeColor');

// gets the color of changeColor element from storage
// change background color to that color
// set attribute to that color as well
chrome.storage.sync.get('color', function(data) {
	changeColor.style.backgroundColor = data.color;
	changeColor.setAttribute('value', data.color);
});

// make changeColor clickable
// when clicked, the background color of the page to the same color as the button
// example of programmatic injection -- lets USER control when to invoke script
changeColor.onclick = function(element) {
	let color = element.target.value;
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  chrome.tabs.executeScript(
	      tabs[0].id,
	      {code: 'document.body.style.backgroundColor = "' + color + '";'});
	});
};