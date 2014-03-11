var fs = require('fs');
var winston   = require('winston')

var logger = new (winston.Logger)({
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

            //logger.debug(urlInd);
            //logger.debug(_getUrlDepth(urlInd));

            /*
             * GLOBAL
             *
             */


            Pattern pattern = Pattern.compile("adsf|qwer");
            if (pattern.matcher(input).find()) {
                execute();
            }

            /*
             * PRODUCTS
             */
            if(urlInd.indexOf('/us/products') !== -1){

                if(urlInd.indexOf('overview') !== -1){
                    continue;

                }


                if(_getUrlDepth(urlInd) === 5)
                    _buildTag(2, 3, urlInd, all[urlInd]);

               // if(_getUrlDepth(urlInd) === 6)
                  //  _buildTag(2, 4, urlInd, all[urlInd]);


            }


            /*
             for(var key in all[urlInd]) {
                logger.debug('  -- ' + key + ': ' + all[urlInd][key]);
             }
             */

        }
    }


//logger.debug(data);



});

function _getUrlDepth(url) {
    return (url.split("/").length - 1)
}

function _buildTag(startDepth, endDepth, url, wordsObj) {

    logger.debug('Processing URL - ' + url);

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