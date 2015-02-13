// Copyright (c) 2015 Mark Jaroski <mark@geekhive.net>
// This file is part of Duo-Break-Time.
// 
// Duo-Break-Time is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Duo-Break-Time is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Duo-Break-Time.  If not, see <http://www.gnu.org/licenses/>.

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

