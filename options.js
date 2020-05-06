let page = document.getElementById('buttonDiv');
const kButtonColors = ['#3aa757', '#e85453c', '#f9bb2d', '#4688f1'];

// rather than repeat the html for buttons, use a for loop in the js
// create each button, then append the elements to the button div container
function constructOptions(kButtonColors) {
	for (let item of kButtonColors) {
		let button = document.createElement('button');
		button.style.backgroundColor = item;
		button.addEventListener('click', function() {
			chrome.storage.sync.set({color: item}, function() {
				console.log('color is' + item);
			})
		});
		page.appendChild(button);
	}
}

constructOptions(kButtonColors);