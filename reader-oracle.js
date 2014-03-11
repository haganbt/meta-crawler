fs = require('fs')


fs.readFile('data.txt', 'utf8', function (err,data) {

    if (err) {
        return console.log(err);
    }

    var all = JSON.parse(data);

    for(var urlInd in all) {
        if(all.hasOwnProperty(urlInd)){

            //console.log(urlInd);
            //console.log(_getUrlDepth(urlInd));

            /*
             * GLOBAL
             *
             */


            /*
             * PRODUCTS
             */
            if(urlInd.indexOf('/us/products') !== -1){

                _buildTag(0, 3, urlInd, all[urlInd])



            }


            /*
             for(var key in all[urlInd]) {
                console.log('  -- ' + key + ': ' + all[urlInd][key]);
             }
             */

        }
    }


//console.log(data);



});

function _getUrlDepth(url) {
    return (url.split("/").length - 1)
}

function _buildTag(startDepth, endDepth, url, wordsObj) {

    console.log('DEBUG: Processing URL - ' + url);

    // if starts with slash, drop so we dont have empty array value
    if(url.indexOf('/') === 0){
        url = url.slice(1);
    }

    if(_endsWith(url, '/') === true){
        url = url.slice(0,-1);
    }

    // split the url by /
    var parts = url.split("/");
    if(parts.length < startDepth || parts.length < endDepth){
        console.log('ERROR: Incorrect URL parts specified. LENGTH:' + parts.length + ' START:' + startDepth + ' END:' + endDepth + ' - ' + url);
        return;
    }

    console.log('DEBUG: Building tags between "' + parts[startDepth] + '" and "' + parts[endDepth] +'"');
    console.log(parts);




    var tagSting = 'tag.';
    for (var i=startDepth; i < (endDepth -1); i++){
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


    console.log('DEBUG:  -----  ' + tagSting);
    //console.log('DEBUG:   -- ' + keywords);

    console.log('-----');

}

function _endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}