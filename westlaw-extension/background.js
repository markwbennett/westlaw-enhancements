chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'reloadExtension') {
        // First refresh the active tab, then reload the extension
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.reload(tabs[0].id, function() {
                    // Small delay to ensure page starts loading before extension reloads
                    setTimeout(() => {
                        chrome.runtime.reload();
                    }, 100);
                });
            } else {
                chrome.runtime.reload();
            }
        });
    }
}); 