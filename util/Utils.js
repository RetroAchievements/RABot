const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class Utils {

    static isValidUsername( user ) {
        return /^[a-z0-9]{2,20}$/i.test(user);
    }

    static async bestDays( user, days ) {
        if( !Utils.isValidUsername( user ) )
            return false;

        const url = 'https://retroachievements.org/history.php?u=' + user;
        let date = [];
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

        return {
            'date': date,
            'cheevos': cheevos,
            'score': score
        };
    }

    static async bestScoreComment( user ) {
        const bestDay = await Utils.bestDays( user, 1 );
        if( !bestDay )
            return false

        const bestScore = bestDay.score[0];
        let scoreComment = false;

        if( bestScore >= 3500 ) {
            scoreComment = `**Best score in a day**: ${bestScore}\n`;
            if( bestScore >= 10000 )
                scoreComment += "**GASP! This user has a ridiculously unreal score for a single day!!!**";
            else if( bestScore >= 6000 )
                scoreComment += "**WOW!** This user seems to play retrogames all day long!";
            else if( bestScore >= 5000 )
                scoreComment += "That's a pretty dedicated retrogamer";
            else // the ">= 3500" case
                scoreComment += "That's a good retrogamer!";
        }
        return scoreComment;
    }

};
