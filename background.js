// Copyright (c) 2015 Mark Jaroski <mark@geekhive.net>

// Extension which monitors web browsing, and rewards achievments in
// learning applications with access to cartoons, etc.
//
//

var duoTabId;

// FIXME get this from the config
var blockedSites = [
        "*://*.youtube.com/"
    ];

function allowBlockedSites() {
    var allowFor = 45; // FIXME get this from the config
    setTimeout(disallowBlockedSites, allowFor);
    chrome.webRequest.onBeforeRequest.removeListener(interceptRequest);
}

function disallowBlockedSites() {
    if (duoTabId != null) chrome.tabs.sendMessage(duoTabId, "time up");
    chrome.webRequest.onBeforeRequest.addListener(
        interceptRequest;
        {
            urls: blockedSites; 
            types: ["main_frame"]
        },
        ["blocking"]
    );
}

function spendLingot() {
    var commentID = 6970258; // FIXME get this from the config
    // construct the URL
    var URL = "https://www.duolingo.com/comments/" + commentID + "/love";
    var x = new XMLHttpRequest();
    x.open('POST', URL); // give-love doesn't accept any data!
    x.responseType = 'json';
    x.onload = function() {
        // if we're here it worked!
        allowBlockedSites();
        sendResponse();
    };
    x.onerror = function() {
        errorCallback('Network Error');
    };
    x.send();
}

function errorCallback(err) {
    alert(err); // FIXME should use a desktop message, it's nicer
}

function interceptRequest() {
    // TODO: consder building a landing page to let the user know what's going on
    return { redirectUrl: "http://duolingo.com" };
}



chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        duoTabId = sender.tab.id;
        if (message == "spend lingot") spendLingot();
    }
);

