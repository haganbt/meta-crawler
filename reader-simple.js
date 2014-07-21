fs = require('fs')


fs.readFile('ford.json', 'utf8', function (err,data) {

    if (err) {
        return console.log(err);
    }

    var all = JSON.parse(data);

    for(var urlInd in all) {
        if(all.hasOwnProperty(urlInd)){

           // console.log('URL:" '+urlInd);
            //console.log(all[urlInd]);

            for(var key in all[urlInd]) {
                console.log(key);
            }

        }
    }


//console.log(data);



});