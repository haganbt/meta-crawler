var Crawler = require("simplecrawler");
var crawler = Crawler.crawl("http://ford.com/");
var moment  = require('moment');
var store   = {};
var fs      = require('fs');

crawler.interval = 500;
crawler.maxConcurrency = 3;
crawler.timeout = 5000;
crawler.stripQuerystring = true;
//crawler.initialPath = '/us/en_us/';


crawler.addFetchCondition(function(parsedURL) {
    // todo - ignore js and not jsp
    if (parsedURL.path.match(/\.(css|jpg|pdf|gif|docx|png|ico)/i)) {
        //console.log("INFO: Ignoring ",parsedURL.path);
        return false;
    }
    return true;
});


crawler.on("fetchcomplete",function(queueItem, responseBuffer, response) {

    var path =  _cleanPath(queueItem.path);
    console.log('RECEIVED: ' + queueItem.path);

    try {

        var result = responseBuffer.toString('utf-8')
        var title = result.match(/<meta(?=[^>]*\bname="title")[^>]*\bcontent="(.*?)".*/i)[1];
        //var description = result.match(/<meta(?=[^>]*\bname="description")[^>]*\bcontent="(.*?)".*/i)[1];

        if(title !== null && title !== '' && path !== null){
            console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + ' - Processing TITLE response.');
            store[path] = store[path] || {};

            title = title.replace(/^\s+|\s+$/g, '');  // trim
            var allTitles = title.split('.');

            for (var y = 0; y < allTitles.length; y++) {

                allTitles[y] = allTitles[y].replace(/^\s+|\s+$/g, '');  // trim

                if(allTitles[y] === ''){
                    continue;
                }

                store[path][allTitles[y]] = store[path][allTitles[y]] || 0;
                store[path][allTitles[y]] ++;
        }

        }

    } catch (e){
        console.log('ERROR: No TITLE data - ' + e);
    }


    // keywords
    try {

        var result = responseBuffer.toString('utf-8')

        var keywords = result.match(/<meta(?=[^>]*\bname="keywords")[^>]*\bcontent="(.*?)".*/i)[1];

        if(keywords !== null && keywords !== '' && path !== null){
            console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + ' - Processing response.');
            store[path] = store[path] || {};

            keywords = keywords.replace(/^\s+|\s+$/g, '');  // trim
            var allKeywords = keywords.split(',');

            for (var i = 0; i < allKeywords.length; i++) {

                allKeywords[i] = allKeywords[i].replace(/^\s+|\s+$/g, '');  // trim

                if(allKeywords[i] === ''){
                    continue;
                }

                store[path][allKeywords[i]] = store[path][allKeywords[i]] || 0;
                store[path][allKeywords[i]] ++;
            }

        }

    } catch (e){
        console.log('ERROR: No KEYWORD data - ' + e);
    }


    // save
    if(~~(Math.random() * 10) + 1 === 3){
        _save(store);
    }

});


crawler.on("complete",function(queueItem, responseBuffer, response) {
    console.log('******* Collection Complete *******') ;
});


// ------------------------


function _cleanPath(path) {

    // strip index.html from the end of the path
    if(_endsWith(path, 'index.html')){
        path =  path.replace('index.html','');
    }

    return path;

}

function _endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function _save(data) {
    fs.writeFile("ford.json", JSON.stringify(data), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + ' - Data saved.');
        }
    });
}


