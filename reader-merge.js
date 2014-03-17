var fs = require('fs');
var winston   = require('winston')

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: 'info' })
    ]
});



var store = {};


fs.readFile('data.txt', 'utf8', function (err,data) {

    if (err) {
        return logger.debug(err);
    }

    var all = JSON.parse(data);

    for(var urlInd in all) {
        if(all.hasOwnProperty(urlInd)){


           /*
            * GLOBAL - urls to drop
            */

            if(_dropUrls(urlInd, ['green','a-to-z', 'ssLINK', 'product-list','download','partnerships','.jpg','register']) === true){
                continue;
            }

            /*
             * CUSTOM - any custom modifications
             */

            if(urlInd.indexOf('/overview') !== -1){
                urlInd = urlInd.replace('/overview','');
            }



            /*
             *
             * Keywords
             *
             *
             */


            // Build an array of all keywords for a given url
            var eachUrlKeywords = new Array();

            // todo - fix this in the collector
            var stringy = JSON.stringify(all[urlInd]);


            if(stringy === undefined || stringy === '{"":1}'){
                continue;
            }

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

            // split the url by /
            var urlParts = urlInd.split("/");
            var rebuiltUrl = '';
            // iterate the path bits and rebuild in the store obj
            for (var i = 0; i < urlParts.length; i++) {

                // drop specific parts of the url
                if(_dropUrls(urlInd, ['.html','href']) === true){
                    continue;
                }

                rebuiltUrl = rebuiltUrl + urlParts[i] + '/';
                store[rebuiltUrl] = store[rebuiltUrl] || [];
                store[rebuiltUrl].push(eachUrlKeywords);

            }

        }
    }

    //console.log(store);


    for(var i in store) {

        console.log(i);
        console.log('  ' +store[i]);
        console.log('-----------');
    }




});

// ------

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

function _buildTag(startDepth, endDepth, url, wordsObj) {

    logger.debug('Processing URL - ' + url);


    if(url.indexOf('overview') !== -1){
        endDepth = endDepth -1;
    }



    // if starts/ends with slash, drop so we dont have empty array value
    if(url.indexOf('/') === 0){
        url = url.slice(1);
    }
    if(_endsWith(url, '/') === true){
        url = url.slice(0,-1);
    }

    // split the url by /
    var parts = url.split("/");
    if(parts[startDepth] === undefined || parts[endDepth] === undefined){
        logger.debug('ERROR: Incorrect URL parts specified. LENGTH:' + parts.length + ' START:' + startDepth + ' END:' + endDepth + ' - ' + url);
        logger.debug('-----');
        return;
    }

    logger.debug('DEBUG: Building tags between "' + parts[startDepth] + '" and "' + parts[endDepth] +'"');
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
        keywords += key.trim() + ', '
    }

    keywords = keywords.slice(0, -2)
    tagSting += keywords + '" }';

    // todo - fix this in the collector
    if(keywords !== ''){
        console.log(tagSting);
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