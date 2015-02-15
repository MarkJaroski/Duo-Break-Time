// Saves options to chrome.storage.sync.
function save_options() {
  var minutes = document.getElementById('minutes').value;
  chrome.storage.sync.set({
    minutes: minutes,
    commentId: commentId
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
function restore_options() {
  chrome.storage.sync.get({
    minutes: 15,
    commentId: 6970258
  }, function(items) {
    document.getElementById(items.minutes).selected = true;
    document.getElementById('commentId').defaultValue = items.commentId;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

