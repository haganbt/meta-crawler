var Crawler = require("simplecrawler");
var crawler = Crawler.crawl("http://oracle.com/");
var moment  = require('moment');
var store   = {};
var fs      = require('fs');

crawler.interval = 1500;
crawler.maxConcurrency = 3;
crawler.timeout = 5000;
crawler.initialPath = '/us';
crawler.stripQuerystring = true;


crawler.on("fetchcomplete",function(queueItem, responseBuffer, response) {

try {

    var result = responseBuffer.toString('utf-8')
    var keywords = result.match('<meta name="Keywords" content="(.*?)">')[1];
    //var description = result.match('<meta name="Description" content="(.*?)">')[1];
    var path =  _cleanPath(queueItem.path);



    if(keywords !== null && path !== null){
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

        // save
        if(~~(Math.random() * 10) + 1 === 3){
            _save(store);
        }


    }



} catch (e){
    //console.log(e);
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
    fs.writeFile("data.json", JSON.stringify(data), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + ' - Data saved.');
        }
    });
}


