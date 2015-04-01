// Saves options to chrome.storage.sync.
function save_options() {
    var data = {
    minutes      : document.getElementById('minutes').value,
    commentId    : document.getElementById('commentId').value,
    blacklist     : listToArray(document.getElementById("site-list")),
    whitelist    : listToArray(document.getElementById("white-list")),
    useWhitelist : document.getElementById("mode_whitelist").checked
    };
    console.log("saving: " + data);
    chrome.storage.sync.set(data, function() {
        chrome.runtime.sendMessage(null, "duo-options-saved", {}, function(resp) {});
    });
}

function validateMinutes() {
    var min = document.getElementById('minutes');
    console.log("validating " + min.value);
    if (!min.value) min.value = 15;
    // we need two minutes becase we post a message to the user one minute
    // in advance
    if (min.value < 2) min.value = 2; 
    save_options();
}

// Restores select box and checkbox state using the preferences
function restore_options() {
  chrome.storage.sync.get({
    useWhitelist: false,
    minutes: 15,
    // wataya: 6970258
    //     me: 6969554
    commentId: 6970258,
    whitelist: [{
            pattern: "*://*.khanacademy.org/*", 
            name: "www.khanacademy.com", 
            favicon: "http://www.khanacademy.org/favicon.ico"
    }],
    blacklist: [{
            pattern: "*://*.youtube.com/*", 
            name: "www.youtube.com", 
            favicon: "https://www.youtube.com/favicon.ico"
    }]
  }, function(items) {
    document.getElementById('commentId').defaultValue = items.commentId;
    document.getElementById('commentId').addEventListener('change', save_options);
    document.getElementById('minutes').defaultValue = items.minutes;
    document.getElementById('minutes').addEventListener('change', validateMinutes);
    if (items.useWhitelist) {
        showWhitelist();
        document.getElementById("mode_whitelist").checked = true;
    } else {
        hideWhitelist();
        document.getElementById("mode_blacklist").checked = true;
    }
    document.getElementById('mode_blacklist').addEventListener('change', toggleWhitelist);
    document.getElementById('mode_whitelist').addEventListener('change', toggleWhitelist);
    document.getElementById('whitelist-select-all').addEventListener('change', function() {
        selectAll(document.getElementById("white-list"));
    });
    document.getElementById("delete-whitelist-selected").addEventListener("click", function() {
        deleteSelected(document.getElementById("white-list"));
    });
    document.getElementById('sitelist-select-all').addEventListener('change', function() {
        selectAll(document.getElementById("site-list"));
    });
    document.getElementById("delete-selected").addEventListener("click", function() {
        deleteSelected(document.getElementById("site-list"));
    });
    items.blacklist.forEach(function(item) {
        addListItem(document.getElementById('site-list'), item.name, item.pattern, item.favicon);
    });
    items.whitelist.forEach(function(item) {
        addListItem(document.getElementById('white-list'), item.name, item.pattern, item.favicon);
    });
    document.getElementById("add-site").addEventListener("click", addToSitelist);
    document.getElementById("site-to-add").addEventListener("change", addToSitelist);
    document.getElementById("add-whitelist-site").addEventListener("click", addToWhitelist);
    document.getElementById("whitelist-site-to-add").addEventListener("change", addToWhitelist);
  });
}

function addToSitelist () {
    // TODO don't let the user add Duo to this list!
    var textbox = document.getElementById("site-to-add");
    var list = document.getElementById("site-list");
    checkDomainName(textbox.value, list);
    textbox.value = "";
}

function addToWhitelist () {
    var textbox = document.getElementById("whitelist-site-to-add");
    var list = document.getElementById("white-list");
    checkDomainName(textbox.value, list);
    textbox.value = "";
}

function toggleWhitelist() {
    if (document.getElementById("mode_whitelist").checked == true) {
        showWhitelist();
    } else {
        hideWhitelist();
    }
    save_options();
}

function showWhitelist() {
    whitelist = document.getElementById('whitelist');
    whitelist.setAttribute("class","whitelist");
}

function hideWhitelist() {
    whitelist = document.getElementById('whitelist');
    whitelist.setAttribute("class","whitelist hidden");
}

function selectAll(list) {
    console.log("selecting all");
    var items = list.getElementsByTagName("input");
    var checked = items.item(0).checked;
    for (i = 1; i < items.length; i++) { //skip i = 0
        if (items.item(i).type == 'checkbox' && items.item(i).id != "duo-check") 
                items.item(i).checked = checked;
        if (items.item(i).type == 'button') {
            if (checked) {
                items.item(i).setAttribute('class', 'site-list-control');
            } else {
                items.item(i).setAttribute('class', 'site-list-control hidden');
            }
        }
    }
}

function deleteSelected(list) {
    console.log("deleting");
    var items = list.getElementsByTagName("input");
    var checked = items.item(0).checked;
    var remove = [];
    for (i = 1; i < items.length; i++) { //skip i = 0
        if (items.item(i).type == 'checkbox' 
            && items.item(i).id != "duo-check" // just in case
            && items.item(i).checked) {
                li = items.item(i).parentElement.parentElement;
                remove.push(li);
        }
    }
    remove.forEach(function(li) {
        list.removeChild(li);
    });
    items.item(0).checked = false;
    save_options();
}

function listToArray(list) {
    var sites = new Array();
    var items = list.getElementsByTagName("input");
    for (i = 1; i < items.length; i++) { //skip select-all box
        if (items.item(i).type != 'checkbox') continue;
        if (items.item(i).id == 'duo-check') continue;
        var label = items.item(i).parentElement;
        var span = label.getElementsByTagName("span").item(0);
        var img = label.getElementsByTagName("img").item(0);
        var site = {
            name: span.firstChild.textContent,
            pattern: items.item(i).value,
            favicon: img.getAttribute("src")
        };
        sites.push(site);
    }
    return sites;
}

function toggleDelete(list) {
    var items = list.getElementsByTagName("input");
    var checked = false;
    var button;
    for (i = 1; i < items.length; i++) { //skip i = 0 
        if (items.item(i).type == 'checkbox' && items.item(i).checked) 
                checked = true;
        if (items.item(i).type == 'button')
                button = items.item(i);
    }
    if (checked) {
        button.setAttribute('class', 'site-list-control');
    } else {
        button.setAttribute('class', 'site-list-control hidden');
    }
}

function checkDomainName(text, list) {
    if (!text) return;
    var url = "http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q="
            + encodeURIComponent(text);
    var x = new XMLHttpRequest();
    x.open('GET', url);
    x.responseType = 'json';
    x.onload = function() {
        var response = x.response;
        if (!response || !response.responseData || !response.responseData.results ||
                response.responseData.results.length === 0) {
            return;
        }
        var firstResult = response.responseData.results[0];
        var uri = new URI(firstResult.url);
        if (uri.domain() == "duolingo.com") return; // users shouldn't add duo to either list
        var pattern = "*://*." + uri.domain() + "/*";
        console.log(firstResult.visibleUrl);
        var favicon = new URI(uri);
        favicon.path("/favicon.ico");

        addListItem(list, firstResult.visibleUrl, pattern, favicon.toString());
    };
    x.onerror = function() {
        // XXX let the user know it didn't work
    };
    x.send();
}

function addListItem(list, name, pattern, favicon) {
        var li  = document.createElement("li");
        var lbl = document.createElement("label");
        var box = document.createElement("input");
        var img = document.createElement("img");
        var spn = document.createElement("span");

        lbl.setAttribute("class", "select")
        box.setAttribute("type", "checkbox");
        box.setAttribute("value", pattern);
        box.addEventListener("change", function() { toggleDelete(list); });
        img.setAttribute("class", "favicon");
        img.setAttribute("src", favicon);
        spn.setAttribute("class", "domain-text");
        spn.appendChild(document.createTextNode(name));

        lbl.appendChild(box);
        lbl.appendChild(img);
        lbl.appendChild(spn);
        li.appendChild(lbl);
        list.appendChild(li);
        save_options();
}

document.addEventListener('DOMContentLoaded', restore_options);

