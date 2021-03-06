const btnExport = document.getElementById("WAXP_EXPORT");

document.addEventListener('click', function(e) {
    switch(e.target.id){
        case "WAXP_EXPORT":
            var configOptions = getConfigOptions();
            sendMessageToWAXP(JSON.stringify(configOptions));
            if(configOptions.EXPORT_TYPE != 'instant-export-unknown-numbers')
                document.getElementById('stopButton').classList.toggle('hidden');
            break;
        case "stopButton":
            sendMessageToWAXP('stopAutoScroll');
            document.getElementById('stopButton').classList.toggle('hidden');
            break;
        case "gearIcon":
            document.getElementById('moreOptions').classList.toggle("hidden");
            break;
        case "page1":
            addActiveClass('page1');
            break;
        case "page2":
            addActiveClass('page2');
            break;           
        case "page3":
            addActiveClass('page3');
            break;
    }
});

function getConfigOptions(){
    return {
        'EXPORT_TYPE': document.getElementById('exportType').value,
        // 'UNKNOWN_CONTACTS_ONLY': document.getElementById('unknownContactsOnly').checked,
        'NAME_PREFIX': document.getElementById('namePrefix').value,
        'SCROLL_INTERVAL': document.getElementById('scrollInterval').value,
        'SCROLL_INCREMENT': document.getElementById('scrollIncrement').value
    }
}

function addActiveClass(id){
    var ids = ['page1','page2','page3'];
    ids.splice(ids.indexOf(id), 1);
    var el = document.getElementById(id);
    if(!el.classList.contains('active')){
        document.getElementById(id).classList.add('active');
        document.getElementById(ids[0]).classList.remove('active');
        document.getElementById(ids[1]).classList.remove('active');
        //  show/hide pages
        document.getElementById(id+'Content').classList.remove('hidden');
        document.getElementById(ids[0]+'Content').classList.add('hidden');
        document.getElementById(ids[1]+'Content').classList.add('hidden');
    }
    
}

function sendMessageToWAXP(message){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:message}, function(response){
           //nothing for now..just send message
        });
    });
}
const groupNameField = document.getElementById("groupName");

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    if(tabs[0].url.match(/https{0,1}:\/\/web.whatsapp.com\//)){
            document.getElementById('ol_step1').classList.add('hidden');
    }

    chrome.tabs.sendMessage(tabs[0].id, {type:"currentGroup"}, function(response){
        btnExport.disabled = response ? false : true;
        groupNameField.innerText = response;
    });
});