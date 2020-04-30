/*
    Written by Shan Eapen Koshy
    Date: 14 March 2020
    Last Modified: 30 April 2020

    Instructions
    1. Open WhatsApp Web and open any group chat
    2. click group name and SCROLL TO THE BOTTOM OF THE MEMBERS LIST
    3. Copy-paste the script in the console

    ** NOTES
    This script uses the latest ECMA Script 2020 optional chaining..updating browser to the latest version maybe required

*/

/**
 * @params <none>
 * @returns { downloadAsCSV(), start(), stop(), debug() }
 */

WAXP = (function(){
    
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var SCROLL_INTERVAL_CONSTANT = 3000, SCROLL_INCREMENT = 140, MEMBERS_QUEUE = {}, AUTO_SCROLL = false, TOTAL_MEMBERS;

    var membersList = document.querySelectorAll('span[title=You]')[0]?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode;
    var scrollInterval, observer;
    let header = document.getElementsByTagName('header')[0];
    let height = header.nextSibling.scrollHeight;

    console.log("%c WhatsApp Group Contacts Exporter ","font-size:24px;font-weight:bold;color:white;background:green;");

    var start = function(){
        observer = new MutationObserver(function (mutations, observer) {   
            scrapeData(); // fired when a mutation occurs
        });
    
        // the div to watch for mutations
        observer.observe(membersList, {
            childList: true,
            subtree: true
        });

        TOTAL_MEMBERS = membersList.parentElement.parentElement.querySelector('span').innerText.match(/\d+/)[0]*1;

        //scroll to top before beginning
        header.nextSibling.scrollTop = 0;
       
        //FOR DEBUGGING
        // console.log({
        //     'SCROLL_INTERVAL_CONSTANT': SCROLL_INTERVAL_CONSTANT,
        //     'SCROLL_INCREMENT': SCROLL_INCREMENT,
        //     'AUTO_SCROLL': AUTO_SCROLL,
        //     'TOTAL_MEMBERS': TOTAL_MEMBERS
        // });

        if(AUTO_SCROLL) scrollInterval = setInterval(autoScroll, SCROLL_INTERVAL_CONSTANT);    
    }

    
    /**
     * @description Function to autoscroll the div
     */

    var autoScroll = function (){
        if(header.nextSibling.scrollTop + 59 < height) 
            header.nextSibling.scrollTop += SCROLL_INCREMENT;
        else
            stop()
    };

    /**
     * @description Stops the current WAXP instance
     */

    var stop = function(){
        window.clearInterval(scrollInterval);
        observer.disconnect();
        console.log("Extraction Completed..")
    }

    /**
     * @description Function to scrape member data
     */
    var scrapeData = function () {
        var phone, status, name;
        var memberCard = membersList.querySelectorAll(':scope > div');

        for (let i = 0; i < memberCard.length; i++) {

            status = memberCard[i].querySelectorAll('span[title]')[1] ? memberCard[i].querySelectorAll('span[title]')[1].title : "";
            phone = scrapePhoneNum(memberCard[i]);
            name = scrapeName(memberCard[i]);

            if (phone!='NIL' && !MEMBERS_QUEUE[phone]) {
                MEMBERS_QUEUE[phone] = [name, status];
            }

            console.log(`%c Extracted [${debug().size} / ${TOTAL_MEMBERS}] Members `,`font-size:13px;color:white;background:green;border-radius:10px;`)
        }
    }

    /**
     * @description scrapes phone no from html node
     * @param {object} el - HTML node
     * @returns {string} - phone number without special chars
     */

    var scrapePhoneNum = function(el){
        var phone;
        if (el.querySelector('img') && el.querySelector('img').src.match(/u=[0-9]*/)) {
           phone = el.querySelector('img').src.match(/u=[0-9]*/)[0].substring(2).replace(/[+\s]/g, '');
        } else {
           var temp = el.querySelector('span[title]').getAttribute('title').match(/(.?)*[0-9]{3}$/);
           phone = temp ? temp[0].replace(/\D/g,'') : 'NIL';
        }
        return phone;
    }
    
    /**
     * @description Scrapes name from HTML node
     * @param {object} el - HTML node
     * @returns {string} - returns name..if no name is present phone number is returned
     */

    var scrapeName = function (el){
        var expectedName;
        expectedName = el.firstChild.firstChild.childNodes[1].childNodes[1].childNodes[1].querySelector('span').innerText;
        if(expectedName == ""){
            return el.querySelector('span[title]').getAttribute('title');
        }
        return expectedName;
    }


    /**
     * @description A utility function to download the result as CSV file
     * @References
     * [1] - https://stackoverflow.com/questions/4617935/is-there-a-way-to-include-commas-in-csv-columns-without-breaking-the-formatting
     * 
     */
    var downloadAsCSV = function () {

        var name = "member-details.csv",
            type = "data:attachment/text",
            data = "Name,Phone,Status\n";

        for (key in MEMBERS_QUEUE) {
            // Wrapping each variable around double quotes to prevent commas in the string from adding new cols in CSV
            // replacing any double quotes within the text to single quotes
            data += `"${MEMBERS_QUEUE[key][0]}","${key}","${MEMBERS_QUEUE[key][1].replace(/\"/g,"'")}"\n`;
        }
        var a = document.createElement('a');
        a.style.display = "none";

        var url = window.URL.createObjectURL(new Blob([data], {
            type: type
        }));
        a.setAttribute("href", url);
        a.setAttribute("download", name);
        document.body.append(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    /**
     * @description Debug function 
     * @returns { size, MEMBERS_QUEUE }
     */

    var debug = function () {
        var size = 0,
            key;
        for (key in MEMBERS_QUEUE) {
            if (MEMBERS_QUEUE.hasOwnProperty(key)) size++;
        }
        
        return {
            size: size,
            q: MEMBERS_QUEUE
        }
    }

   
    // Defines the WAXP interface following module pattern
    return {
            start: function(config){
                MEMBERS_QUEUE = {}; //reset
              
                if(config == undefined){
                    console.log('Starting with default options..');
                }else if (typeof config == 'object'){
                    // didn't use ternary op since the else part isn't used
                    if(config.AUTO_SCROLL != undefined) AUTO_SCROLL = config.AUTO_SCROLL;
                    if(config.SCROLL_INCREMENT != undefined) SCROLL_INCREMENT = config.SCROLL_INCREMENT;
                    if(config.SCROLL_INTERVAL_CONSTANT != undefined) SCROLL_INTERVAL_CONSTANT = config.SCROLL_INTERVAL_CONSTANT;
                }else{
                    console.log('Invalid options..starting with default options..')
                }
                start()
            },
            stop: function(){
                stop()
            },
            resume: function(){
                //resume starts without resetting the MEMBERS_QUEUE
                start()
            },
            downloadCSV: function(){
                downloadAsCSV()
            },
            debug: function () {
                debug()
            }
    }
})();
