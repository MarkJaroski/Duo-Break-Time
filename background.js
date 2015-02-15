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
var allowedTabIds = [];
var duoTabIds = [];
var duoUrl = "http://www.duolingo.com/";

// FIXME get this from the config
var blockedSites = [ "*://*.youtube.com/" ];

function allowBlockedSites() {
    var allowForMinutes = 1; // FIXME get this from the config
    setTimeout(disallowBlockedSites, allowForMinutes * 60000);
    chrome.webRequest.onBeforeRequest.removeListener(interceptRequest);
    chrome.webRequest.onCompleted.addListener(
        observeAllowedPage, { urls: blockedSites }
    );
    chrome.webRequest.handlerBehaviorChanged();
    isEquipped = true;
}

function disallowBlockedSites() {
    duoTabIds.forEach(function(tabId, i, array) {
        chrome.tabs.sendMessage(tabId, "time up");
    });
    chrome.webRequest.onBeforeRequest.addListener(
        interceptRequest, { urls: blockedSites }, ["blocking"]
    );
    chrome.webRequest.onCompleted.removeListener(observeAllowedPage);
    allowedTabIds.forEach(function(tabid, i, array) {
        chrome.tabs.update(tabid, {url: duoUrl}); // FIXME this is maybe a little abrupt
    });
    allowedTabIds = [];
    chrome.webRequest.handlerBehaviorChanged();
    isEquipped = false;
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
    };
    x.onerror = function() {
        errorCallback('Network Error');
    };
    x.send();
}

function errorCallback(err) {
    alert(err); // FIXME should use a desktop message, it's nicer
}

function interceptRequest(details) {
    // TODO: consder building a landing page to let the user know what's going on
    return { redirectUrl: duoUrl };
}

function observeAllowedPage(details) {
    allowedTabIds.push(details.tabId);
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        duoTabIds.push(sender.tab.id);
        if (message == "spend lingot") spendLingot();
        if (typeof sendResponse != undefined) sendResponse(isEquipped);
    }
);

disallowBlockedSites();
