// Saves options to chrome.storage
function save_options() {
  var dietaryRestrictions = document.getElementById('diet').value;
  chrome.storage.sync.set({
    diet: dietaryRestrictions,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
}

// Restores select box using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get(['diet'], function(result) {
    document.getElementById('diet').value = result.diet;
  });
}

document.getElementById('option-save').addEventListener('click',
    save_options);

document.addEventListener('DOMContentLoaded', restore_options);
