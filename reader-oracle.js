fs = require('fs')


fs.readFile('data.txt', 'utf8', function (err,data) {

    if (err) {
        return console.log(err);
    }

    var all = JSON.parse(data);

    for(var urlInd in all) {
        if(all.hasOwnProperty(urlInd)){

            //console.log(urlInd);

            if(urlInd.indexOf('/us/products') !== -1){

                console.log('PRODUCTS found: ' + urlInd);
                for(var key in all[urlInd]) {
                    console.log('  -- ' + key + ': ' + all[urlInd][key]);
                }
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