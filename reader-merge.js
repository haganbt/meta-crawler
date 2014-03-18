var fs      = require('fs');
var winston = require('winston');
var stats   = {};
var store = {};
var logger  = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: 'info' })
    ]
});

fs.readFile('data.txt', 'utf8', function (err,data) {

    if (err) {
        return logger.debug(err);
    }

    var all = JSON.parse(data);

    for(var urlInd in all) {
        if(all.hasOwnProperty(urlInd)){


           /*
            * GLOBAL - urls to drop
            *
            */

            urlInd = urlInd.replace(/^\s+|\s+$/g, '');  // trim
            urlInd = urlInd.toLowerCase();              // lower


            // Drop URLs that contains specific strings

            if(_dropUrls(urlInd, ['legal','contact','social-media','accessibility','welcome','green','image','a-to-z', 'ssLINK', 'product-list','download','partnerships','.jpg','register', 'syndication', 'mosaicmenu','privacy','corporate/region','corporate/role','corporate/task','sitemap','logo','.css']) === true){
                continue;
            }

            // Drop any short urls - typically country codes like /ru/
            if(urlInd.length <=4){
                continue;
            }



            /*
             * CUSTOM - any custom modifications
             *
             */

            if(urlInd.indexOf('overview/') !== -1){
                urlInd = urlInd.replace(/overview\//g, '');
            }

            if(urlInd.indexOf('/en/') !== -1){
                urlInd = urlInd.replace(/\/en\//g, '');
            }

            if(_endsWith(urlInd, 'support/') === true){
                urlInd = urlInd.slice(0,-8);
            }

            if(_endsWith(urlInd, 'whatsnew/') === true){
                urlInd = urlInd.slice(0,-9);
            }

            if(_endsWith(urlInd, '/resources/') === true){
                urlInd = urlInd.slice(0,-10);
            }

            if(urlInd.indexOf('assets') !== -1){
                console.log('+++++' + urlInd);
            }


            /*
             *
             * Keywords
             *
             *
             */

            // todo - drop specific keywords - e.g. oracle



            // Build an array of all keywords for a given url
            var eachUrlKeywords = new Array();

            var stringy = JSON.stringify(all[urlInd]);

            // todo - fix this in the collector
            if(stringy === undefined || stringy === '{"":1}'){
                continue;
            }

            // todo - remove bad characters e.g. "

            // save all keywords to an array
            for(var key in all[urlInd]) {
                var trimmed = key.replace(/^\s+|\s+$/g, '') ;
                eachUrlKeywords.push(trimmed);
            }




            /*
             *
             * URLs
             *
             *
             */


            // drop leading "/"
            if(urlInd.indexOf('/') === 0){
                urlInd = urlInd.slice(1);
            }

            // drop trainilng "/"
            if(_endsWith(urlInd, '/') === true){
                urlInd = urlInd.slice(0,-1);
            }

            // drop leading "us/"
            if(urlInd.indexOf('us/') === 0){
                urlInd = urlInd.slice(3);
            }

            var urlParts = urlInd.split("/");
            var rebuiltUrl = '';
            // iterate the path bits and rebuild in the store obj
            for (var i = 0; i < urlParts.length; i++) {

                // drop specific parts of the url
                if(_dropUrls(urlInd, ['.html','.htm','href']) === true){
                    continue;
                }

                rebuiltUrl = rebuiltUrl + urlParts[i] + '/';
                store[rebuiltUrl] = store[rebuiltUrl] || [];
                store[rebuiltUrl] = store[rebuiltUrl].concat(eachUrlKeywords);

            }

        }
    }




    /*
     *
     * PROCESS
     *
     *
     */

    // sort
    store = _sortObj(store);

    // build stst for each section
    _getStats(store);

    // build tags
    for(var i in store) {
        _buildTag(i, store[i])
    }


});

// --------------------------------------


function _getStats(storeObj) {


    var keys    = Object.keys(storeObj);

    for (var i = 0; i < keys.length; i++) {
        //console.log(keys[i]);

        var chunks = keys[i].split('/');

        stats[chunks[0]] = stats[chunks[0]] || {};
        stats[chunks[0]].urlCount = stats[chunks[0]].urlCount || 0;
        stats[chunks[0]].urlCount ++;

        stats[chunks[0]].totalSectionChunks = stats[chunks[0]].totalSectionChunks || 0;
        stats[chunks[0]].totalSectionChunks += chunks.length -1;

        stats[chunks[0]].averageTagLength = stats[chunks[0]].averageTagLength || 0;
        stats[chunks[0]].averageTagLength = stats[chunks[0]].totalSectionChunks / stats[chunks[0]].urlCount;
        stats[chunks[0]].averageTagLength = Math.round(stats[chunks[0]].averageTagLength * 100) / 100; // round to 2 decimals
    }

    /*
    // output stats
    for(var url in stats) {
        if(stats.hasOwnProperty(url)){
            console.log(url);
            for(var key in stats[url]) {
                console.log('  -- ' + key + ': ' + stats[url][key]);
            }

        }
    }
    */
}



/*
 * @param string
 * @param array
 * @return boolean
 */
function _dropUrls(url, list){
    var length = list.length;
    while(length--) {
        if (url.indexOf(list[length])!=-1) {
            return true;
        }
    }
    return false;
}


function _getUrlDepth(url) {
    return (url.split("/").length - 1)
}


function _buildTag(url, wordsObj) {

    logger.debug('Processing URL - ' + url);

    // if starts/ends with slash, drop so we dont have empty array value
    if(url.indexOf('/') === 0){
        url = url.slice(1);
    }
    if(_endsWith(url, '/') === true){
        url = url.slice(0,-1);
    }

    var parts = url.split("/");
    var startDepth = 0;
    var endDepth = parts.length -1;

    // section ststs
    if(url in stats){
        console.log("\n\n/*");
        console.log(' * STATS for path "'+url + '"');
        console.log(' *  - Total URL Count: '+ stats[url]['urlCount']);
        console.log(' *  - Total URL Sections: '+ stats[url]['totalSectionChunks']);
        console.log(' *  - Average Section Length: '+ stats[url]['averageTagLength']);
        console.log(" */\n");
    }

    if(parts[startDepth] === undefined || parts[endDepth] === undefined){
        logger.debug('ERROR: Incorrect URL parts specified. LENGTH:' + parts.length + ' START:' + startDepth + ' END:' + endDepth + ' - ' + url);
        logger.debug('-----');
        return;
    }

    logger.debug('Building tags between "' + parts[startDepth] + '" and "' + parts[endDepth] +'"');
    logger.debug(parts);


    var tagSting = 'tag.';
    for (var i=startDepth; i < (endDepth); i++){
        tagSting += parts[i] + '.';
    }
    tagSting = tagSting.slice(0, -1)
    tagSting += ' "' + parts[endDepth]  + '" { interaction.content ANY "';

    // build a string from the saved keywords
    var keywords = '';

    for(var key in wordsObj) {
        keywords += wordsObj[key].trim() + ', '
    }

    keywords = keywords.slice(0, -2)
    tagSting += keywords + '" }';

    // todo - fix this in the collector
    if(keywords !== ''){

        console.log('// '+url);
        console.log(tagSting);
        console.log('');
    }

    logger.debug('-----');

}


function _endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}


function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}


/*
* sortObj - sort an object by a key
*
* @param - object
* @return obj - a sorted obj
*/
function _sortObj(myObj) {

    var keys = Object.keys(myObj)
        , i
        , len = keys.length
        , returnObj = {}
        ;

    keys.sort();

    for (i = 0; i < len; i++)
    {
        k = keys[i];
        returnObj[k] = returnObj[k] ||  myObj[k];
    }

    return returnObj;
}
