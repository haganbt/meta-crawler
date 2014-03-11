var Crawler = require("simplecrawler");
var crawler = Crawler.crawl("http://oracle.com/");
var moment  = require('moment');
var store   = {};
var fs      = require('fs');

crawler.interval = 500;
crawler.maxConcurrency = 3;
crawler.timeout = 40000;
crawler.initialPath = '/us';
crawler.stripQuerystring = true;


crawler.on("fetchcomplete",function(queueItem, responseBuffer, response) {

try {

    var result = responseBuffer.toString('utf-8')
    var keywords = result.match('<meta name="Keywords" content="(.*?)">')[1];
    //var description = result.match('<meta name="Description" content="(.*?)">')[1];
    var path =  _cleanPath(queueItem.path);



    if(keywords !== null && path !== null){
        console.log('.');
        store[path] = store[path] || {};

        var allKeywords = keywords.split(',');

        for (var i = 0; i < allKeywords.length; i++) {
            store[path][allKeywords[i]] = store[path][allKeywords[i]] || 0;
            store[path][allKeywords[i]] ++;
        }

        // save
        if(~~(Math.random() * 5) + 1 === 3){
            _save(store);
        }


    }



} catch (e){
    //console.log(e);
}

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
    fs.writeFile("data.txt", JSON.stringify(data), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log('Last save: ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
        }
    });
}


