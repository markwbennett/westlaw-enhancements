document.addEventListener('DOMContentLoaded', async function() {
  const toggle = document.getElementById('toggle');
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  const url = new URL(tab.url);
  const siteKey = 'hc-disable-' + url.hostname;
  function updateToggleFromStorage() {
    chrome.storage.local.get([siteKey], function(result) {
      const disabled = result[siteKey] === true;
      toggle.checked = !disabled;
    });
  }
  updateToggleFromStorage();
  toggle.addEventListener('change', function() {
    const disabled = !toggle.checked;
    chrome.storage.local.set({[siteKey]: disabled}, function() {
      chrome.tabs.sendMessage(tab.id, {type: 'HC_TOGGLE', disabled});
      // No need to update UI here; will be correct on next popup open
    });
  });
}); 