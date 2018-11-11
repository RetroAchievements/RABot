const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class Utils {

    static isValidUsername( user ) {
        return /^[a-z0-9]{2,20}$/i.test(user);
    }

    static async bestdays( user, days ) {
        if( !Utils.isValidUsername( user ) )
            return false;

        const url = 'https://retroachievements.org/history.php?u=' + user;
        let dates = [];
        let cheevos = [];
        let score = [];

        const res = await fetch( url + '&c=' + days)
        const $ = cheerio.load( await res.text() );

        const bestDays = $('table.smalltable').find('tr').map( (i, element) => ({
            date: $(element).find('td:nth-of-type(1)').text().trim(),
            achievements: $(element).find('td:nth-of-type(2)').text().trim(),
            score: $(element).find('td:nth-of-type(3)').text().trim(),
        })).get();

        if(bestDays.length <= 2) {
            return false;
        }

        for(let i = 1; i <= days && i < bestDays.length; i++) {
            date.push( bestDays[i].date );
            cheevos.push( bestDays[i].achievements );
            score.push( bestDays[i].score );
        }

        return [ date, cheevos, score ];
    }

};
