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


// NOTE: The ID changes if you clone this extension or move it around
var EXT_ID = "flbjncldlhhmibhkadedknehmeapojoh";

var isEquipped = false;

// TODO consider putting these in the config
var TITLE = "Break Time!";
var DESCR = "Each 1 lingot purchase unlocks the list of websites specified by your teacher/parent for 15 minutes.";

var ext_section = document.createElement("div");
ext_section.setAttribute("class", "store-section");
var section_head = document.createElement("h5");
section_head.setAttribute("class", "gray");
var shelf = document.createElement("ul");
shelf.setAttribute("class", "store-shelf");
var item = document.createElement("li");
var icon = document.createElement("span");
icon.setAttribute("class", "store-icon");
var button = document.createElement("a");
button.setAttribute("class","item-purchase btn btn-green buy-item right");
var getfor = document.createElement("span");
getfor.setAttribute("class", "margin-right");
var lingot = document.createElement("span");
lingot.setAttribute("class", "icon icon-lingot-small");
var price = document.createElement("span");
price.setAttribute("class", "price");
var equipped = document.createElement("a");
equipped.setAttribute("class", "item-purchase btn btn-green purchased right");
equipped.setAttribute("disabled", "disabled");
var check = document.createElement("span");
check.setAttribute("class", "icon icon-check-white-small better-margin");
var title = document.createElement("h4");
var desc = document.createElement("p");

function resetButton() {
    item.replaceChild(button, equipped);
    isEquipped = false;
}

chrome.runtime.sendMessage(EXT_ID, "getState", {}, function(response) {
    isEquipped = response;
});

getfor.appendChild(document.createTextNode("Get for:"));
section_head.appendChild(document.createTextNode("EXTENSION"));
ext_section.appendChild(section_head);
button.appendChild(getfor);
button.appendChild(lingot);
price.appendChild(document.createTextNode("1"));
button.appendChild(price);
equipped.appendChild(check);
equipped.appendChild(document.createTextNode(" Equipped"));
title.appendChild(document.createTextNode(TITLE));
desc.appendChild(document.createTextNode(DESCR));
item.appendChild(icon);

if (isEquipped) {
    item.appendChild(equipped);
} else {
    item.appendChild(button);
}

item.appendChild(title);
item.appendChild(desc);
shelf.appendChild(item);
ext_section.appendChild(shelf);

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message == "time up") resetButton();
    }
);

button.addEventListener("click", function() {
    chrome.runtime.sendMessage(EXT_ID, "spend lingot", {}, function(response) {});
    item.replaceChild(equipped, button);
});

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type = "childList" && mutation.addedNodes[2]) {
            var store = mutation.addedNodes[2];
            store.insertBefore(ext_section, store.childNodes[0]);
        }
    });
});

var bodyObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        var store_view = document.getElementById("rupee-store-view");
        if (store_view) observer.observe(store_view, {childList: true});
        if (store = store_view.childNodes[2]) {
            store.insertBefore(ext_section, store.childNodes[0]);
        }
    });
});

bodyObserver.observe(document.body, {childList: true});
