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
var     duoUrl = "http://www.duolingo.com/";
var    appName = "Duo Break Time";
var    iconUrl = "lingot_lock_128.png";
var duoPattern = "*://*.duolingo.com/*";


function allow() {
    chrome.storage.sync.get({ 
            minutes: 15,
    }, function (item) {
        setTimeout(disallow, item.minutes * 60000);
        chrome.webRequest.onBeforeRequest.removeListener(interceptRequest);
        chrome.webRequest.handlerBehaviorChanged();
        isEquipped = true;
    });
}

function disallow() {
    chrome.storage.sync.get({ 
            minutes: 15,
            blacklist: [{ pattern: "*://*.youtube.com/*" }],
            useWhitelist: false
    }, function (item) {

        // convert blacklist to an array of patterns
        var blacklist = [];
        var sites = item.blacklist;
        sites.forEach(function (site) {
            blacklist.push(site.pattern);
        });

        // close active tabs, replacing the last one with duo
        chrome.tabs.query({url: ["*://*.duolingo.com/*"]}, function(result) {
            var duoTabCount = 0;
            result.forEach(function(tab) {
                duoTabCount++;
                chrome.tabs.sendMessage(tab.id, "time up");
            });
            chrome.tabs.query({url: blacklist}, function(result) {
                result.forEach(function(tab, i) {
                    if (duoTabCount == 0 && i == 0) {
                        chrome.tabs.update(tab.id, { url: duoUrl });
                    } else {
                        chrome.tabs.remove(tab.id); // TODO this is maybe a little abrupt
                    }
                });
            });
        });

        // enable blocking
        chrome.webRequest.onBeforeRequest.addListener(
            interceptRequest, { urls: blacklist, types: [ "main_frame"] }, ["blocking"]
        );

        // whitelisting requires a second listener
        if (item.useWhitelist) {
            chrome.webRequest.onBeforeRequest.addListener(
                whitelistIntercept, { types: [ "main_frame" ] }, ["blocking"]
            );
        } else {
            chrome.webRequest.onBeforeRequest.removeListener(whitelistIntercept);
        }

        chrome.webRequest.handlerBehaviorChanged();

        // make the item available in the lingot store
        isEquipped = false;
    });
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
            allow();
        };
        x.onerror = function() {
            errorCallback('Network error: lingot not spent');
        };
        x.send();
    });
}

function errorCallback(err) {
    var notice = {
        type: basic,
        title: appName,
        iconUrl: "lingot_lock_128.png",
        message: err
    };
    chrome.notifications.create('duoBreakTime-error', notice, function() {});
}

// This function handles our blacklist
function interceptRequest(details) {
    var uri = new URI(details.url);
    var notice = {
        type: "basic",
        title: appName,
        iconUrl: iconUrl,
        message: "Access to " + uri.domain() + " will cost a lingot!"
    };
    chrome.notifications.create('duoBreakTime-error', notice, function() {});
    return { redirectUrl: duoUrl };
}

// This allows BOTH the whitelist and blacklist, but blocks everything else
function whitelistIntercept(details) {
    chrome.storage.sync.get({ 
            blacklist: [{ name: "www.youtube.com" }],
            whitelist: [{ name: "www.khanacademy.com" }]
    }, function (item) {

        // convert blacklist to an array of patterns
        var allowed = new URI({host: "www.duolingo.com"});
        var sites = item.blacklist;
        sites.concat(item.whitelist);
        sites.forEach(function (site) {
            allowed.push(new URI({ host: site.name }));
        });

        var uri = new URI(details.url);

        // don't block matches
        allowed.forEach(function(site) {
            if (uri.domain() == site.domain()) return;
        });

        // notify the user
        var notice = {
            type: "basic",
            title: appName,
            iconUrl: iconUrl,
            message: "Access to " + uri.domain() + " is not allowed."
        };
        chrome.notifications.create('duoBreakTime-error', notice, function() {});

        return { redirectUrl: duoUrl };
    });
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message == "spend lingot") spendLingot();
        if (typeof sendResponse != undefined) sendResponse(isEquipped);
    }
);

disallow();
