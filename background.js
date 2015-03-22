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

var     duoUrl = "http://www.duolingo.com/";
var  gitHubUrl = "http://www.github.com/";
var    appName = "Duo Break Time";
var    iconUrl = "lingot_lock_128.png";
var duoPattern = "*://*.duolingo.com/*";

var   isEquipped = false;
var useWhitelist = false;
var    blacklist = [];
var      allowed = [];
var      minutes = 15;

function updateOptions(callback) {
    chrome.storage.sync.get({ 
            minutes: 15,
            blacklist: [{ pattern: "*://*.youtube.com/*" }],
            whitelist: [{ name: "www.khanacademy.com" }],
            useWhitelist: false
    }, function (item) {

        console.log("updating options");

        minutes = item.minutes;

        // convert blacklist to an array of patterns
        var sites = item.blacklist;
        sites.forEach(function (site) {
            blacklist.push(site.pattern);
        });

        //store URIs for whitelist blocking
        var duo = new URI(duoUrl);
        var git = new URI(gitHubUrl);
        allowed = [ duo, git ];
        var sites = item.blacklist;
        sites = sites.concat(item.whitelist);
        sites.forEach(function (site) {
            allowed.push(new URI("http://" + site.name));
        });

        // whitelisting requires a second listener
        if (item.useWhitelist) {
            useWhitelist = true;
            chrome.webRequest.onBeforeRequest.addListener(
                whitelistIntercept, { urls: ["*://*/*"], types: [ "main_frame" ] }, ["blocking"]
            );
        } else {
            chrome.webRequest.onBeforeRequest.removeListener(whitelistIntercept);
        }

        callback();
    });
}


function allow() {
    var notice = {
        type: "basic",
        title: appName,
        iconUrl: "lingot_lock_128.png",
        message: "Break time is almost up!"
    };
    setTimeout(function() { 
        console.log("notifying");
        chrome.notifications.create('duoBreakTime-MinuteTogo', notice, function() {});
    }, ( minutes - 1 ) * 60000);
    setTimeout(disallow, minutes * 60000);
    chrome.webRequest.onBeforeRequest.removeListener(interceptRequest);
    chrome.webRequest.handlerBehaviorChanged();
    isEquipped = true;
}

function disallow() {
    // close active tabs, replacing the last one with duo
    chrome.tabs.query({url: ["*://*.duolingo.com/*"]}, function(result) {
        var duoTabCount = 0;
        result.forEach(function(tab) {
            duoTabCount++;
            // make the item available in any existing ligot store page
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

    chrome.webRequest.handlerBehaviorChanged();

    // make the item available in new lingot store pages
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
        type: "basic",
        title: appName,
        iconUrl: "lingot_lock_128.png",
        message: err
    };
    chrome.notifications.create('duoBreakTime-error', notice, function() {});
}

// This function handles our blacklist
function interceptRequest(details) {
    console.log("Blacklist intercept");
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

    console.log("Whitelist intercept");

    var uri = new URI(details.url);
    var whitelisted = false;

    // don't block matches
    allowed.forEach(function(site) {
        if (uri.domain() == site.domain()) {
            console.log("Allowing " + uri.domain());
            whitelisted = true;
        }
    });

    if (whitelisted) return;

    console.log("Disallowing " + uri.domain());

    // notify the user
    var notice = {
        type: "basic",
        title: appName,
        iconUrl: iconUrl,
        message: "Access to " + uri.domain() + " is not allowed."
    };
    chrome.notifications.create('duoBreakTime-error', notice, function() {});

    return { redirectUrl: duoUrl };
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log(message);
        if (message == "spend lingot") spendLingot();
        if (message == "duo-options-saved") updateOptions(disallow);
        if (typeof sendResponse != undefined) sendResponse(isEquipped);
    }
);

updateOptions(disallow);
