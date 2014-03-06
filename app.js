var Crawler = require("simplecrawler");

var crawler = Crawler.crawl("http://oracle.com/");
var moment  = require('moment');

crawler.interval = 500;
crawler.maxConcurrency = 3;
crawler.timeout = 40000;
crawler.initialPath = '/us';


crawler.on("fetchcomplete",function(queueItem, responseBuffer, response) {

try {
    var result = responseBuffer.toString('utf-8')


    var keyword = result.match('<meta name="Keywords" content="(.*?)">')[1];
    var description = result.match('<meta name="Description" content="(.*?)">')[1];

    console.log('PATH: ' + queueItem.path);
    console.log(keyword);
    //console.log('DESCRIPTION: ' + description);

} catch (e){
    console.log('--');
}

});