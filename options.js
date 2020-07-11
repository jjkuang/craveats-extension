// Saves options to chrome.storage
function save_options() {
  var diet = document.getElementById('diet').value;
  chrome.storage.sync.set({
    diet: diet,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    dietaryRestrictions:'none'
  }, function(result) {
    document.getElementById('diet').value = result.diet;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('option-save').addEventListener('click',
    save_options);
//result.diet