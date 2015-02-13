

// NOTE: this will have to change if you clone this
var EXT_ID = "jfnbmhkijnmhfahmfkamfpelfhgdlegf";

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
}

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
item.appendChild(button);
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
    chrome.runtime.sendMessage(EXT_ID, "spend lingot");
    item.replaceChild(equipped, button);
});

var store_view = document.getElementById("rupee-store-view");
if (store_view.hasChildNodes()) {
    store = store_view.childNodes[2];
    store.insertBefore(ext_section, store.childNodes[0]);
}

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type = "childList" && mutation.addedNodes[2]) {
            var store = mutation.addedNodes[2];
            store.insertBefore(ext_section, store.childNodes[0]);
        }
    });
});

var config = { childList: true, subtree: true };

observer.observe(store_view, config);

