// popup.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    let logButton = document.getElementById('logButton');
    if (!logButton) {
        console.error('logButton not found');
        return;
    }
    logButton.addEventListener('click', function() {
        console.log('logButton clicked');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "log_owner_id_and_email"}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                } else {
                    console.log(response);
                }
            });
        });
    }, false);
}, false);