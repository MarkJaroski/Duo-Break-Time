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

var isEquipped = false;
var duoUrl = "http://www.duolingo.com/";

// FIXME get this from the config
var blockedSites = [ "*://*.youtube.com/*" ];

function allowBlockedSites() {
    chrome.storage.sync.get({ minutes: 15 }, function (items) {
        setTimeout(disallowBlockedSites, items.minutes * 60000);
        chrome.webRequest.onBeforeRequest.removeListener(interceptRequest);
        chrome.webRequest.handlerBehaviorChanged();
        isEquipped = true;
    });
}

function disallowBlockedSites() {
    chrome.tabs.query({url: ["*://*.duolingo.com/*"]}, function(result) {
        var duoTabCount = 0;
        result.forEach(function(tab) {
            duoTabCount++;
            chrome.tabs.sendMessage(tab.id, "time up");
        });
        chrome.tabs.query({url: blockedSites}, function(result) {
            result.forEach(function(tab, i) {
                if (duoTabCount == 0 && i == 0) {
                    chrome.tabs.update(tab.id, {url: duoUrl});
                } else {
                    chrome.tabs.remove(tab.id); // TODO this is maybe a little abrupt
                }
            });
        });
    });
    chrome.webRequest.onBeforeRequest.addListener(
        interceptRequest, { urls: blockedSites }, ["blocking"]
    );
    chrome.webRequest.handlerBehaviorChanged();
    isEquipped = false;
}


function spendLingot() {
    // wataya: 6970258
    //     me: 6969554
    chrome.storage.sync.get({ "commentId": 6969554 }, function(items) {
        // construct the URL
        var URL = "https://www.duolingo.com/comments/" + items.commentId + "/love";
        var x = new XMLHttpRequest();
        x.open('POST', URL); // give-love doesn't accept any data!
        x.responseType = 'json';
        x.onload = function() {
            // if we're here it worked!
            allowBlockedSites();
        };
        x.onerror = function() {
            errorCallback('Network Error');
        };
        x.send();
    });
}

function errorCallback(err) {
    alert(err); // TODO should use a desktop message, it's nicer
}

function interceptRequest(details) {
    // TODO: consder building a landing page to let the user know what's going on
    if (details.url.indexOf('favicon.ico') != -1) return;
    return { redirectUrl: duoUrl };
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message == "spend lingot") spendLingot();
        if (typeof sendResponse != undefined) sendResponse(isEquipped);
    }
);

disallowBlockedSites();
