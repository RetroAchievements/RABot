const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class Utils {

    static isValidUsername( user ) {
        return /^[a-z0-9]{2,20}$/i.test(user);
    }

    static async bestdays( user ) {
        if( !Utils.isValidUsername( user ) )
            return `Invalid username: \`${user}\``;

        const max = 3;
        const url = 'https://retroachievements.org/history.php?c=' + max + '&u=' + user;
        let response = `:trophy: __**${user}'s best days**__ :trophy:\n`;
        response += `<${url}>`;
        response += '```md\n';

        const res = await fetch( url );
        const $ = cheerio.load( await res.text() );

        const bestDays = $('table.smalltable').find('tr').map( (i, element) => ({
            date: $(element).find('td:nth-of-type(1)').text().trim(),
            achievements: $(element).find('td:nth-of-type(2)').text().trim(),
            score: $(element).find('td:nth-of-type(3)').text().trim(),
        })).get();

        if(bestDays.length <= 2) {
            response = `There's no info about \`${user}\``;
            return;
        }

        for(let i = 1; i <= max && i < bestDays.length; i++) {
            response += `\n[${bestDays[i].date}]`;
            response += `( ${bestDays[i].achievements} ) `;
            response += `< ${bestDays[i].score} >`;
        }
        response += '\n```';

        const bestScore = bestDays[1].score;
        if(bestScore >= 3000) {
            if(bestScore >= 10000)
                response += "**Completely unreal score!**";
            else if(bestScore >= 6000)
                response += "**WOW!** This guy seems to play retrogames all day long!";
            else if(bestScore >= 5000)
                response += "That's a pretty dedicated retrogamer";
            else
                response += "That's good retrogamer!";
        }

/*
        fetch(url)
            .then(res => res.text())
            .then(body => {
                const $ = cheerio.load(body);

                const bestDays = $('table.smalltable').find('tr').map( (i, element) => ({
                    date: $(element).find('td:nth-of-type(1)').text().trim(),
                    achievements: $(element).find('td:nth-of-type(2)').text().trim(),
                    score: $(element).find('td:nth-of-type(3)').text().trim(),
                })).get();

                if(bestDays.length <= 2) {
                    response = `There's no info about \`${user}\``;
                    return;
                }

                for(let i = 1; i <= max && i < bestDays.length; i++) {
                    response += `\n[${bestDays[i].date}]`;
                    response += `( ${bestDays[i].achievements} ) `;
                    response += `< ${bestDays[i].score} >`;
                }
                response += '\n```';

                const bestScore = bestDays[1].score;
                if(bestScore >= 3000) {
                    if(bestScore >= 10000)
                        response += "**Completely unreal score!**";
                    else if(bestScore >= 6000)
                        response += "**WOW!** This guy seems to play retrogames all day long!";
                    else if(bestScore >= 5000)
                        response += "That's a pretty dedicated retrogamer";
                    else
                        response += "That's good retrogamer!";
                }
            });
        // TODO: I think I'm supposed to .catch() something here, no?
        */

        return response;
    }

};
