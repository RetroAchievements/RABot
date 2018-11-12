const Command = require('../../structures/Command.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { bestdays } = require('../../util/Utils.js');

module.exports = class BestDaysCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bestdays',
            group: 'rautil',
            memberName: 'bestdays',
            description: 'Get the "best days" info from a player',
            examples: ['`bestdays RA_username`'],
            throttling: {
                usages: 2,
                duration: 120,
            },
            argsPromptLimit: 0,
            args: [
                {
                    key: 'user',
                    type: 'string',
                    prompt: '',
                },
            ],
        });
    }

    async run( msg, { user } ) {
        const days = 3;
        const sentMsg = await msg.reply(':hourglass: Getting info, please wait...');
        const bestDays = await bestdays( user, days );
        if( !bestDays )
            sentMsg.edit(`There's no info for \`${user}\``);

        let response = `:trophy: __**${user}'s best days**__ :trophy:\n`;
        response += '```md\n';

        for(let i = 1; i <= days && i < bestDays.length; i++) {
            response += `\n[${bestDays.date[i]}]`;
            response += `( ${bestDays.cheevos[i]} ) `;
            response += `< ${bestDays.score[i]} >`;
        }
        response += '\n```';

        let scoreComment = '';
        const bestScore = bestDays.score[0];

        if( bestScore >= 3000 ) {
            if( bestScore >= 10000 )
                scoreComment = "**Completely unreal score!!!**";
            else if( bestScore >= 6000 )
                scoreComment = "**WOW!** This user seems to play retrogames all day long!";
            else if( bestScore >= 5000 )
                scoreComment = "That's a pretty dedicated retrogamer";
            else // the ">= 3000" case
                scoreComment = "That's good retrogamer!";
        }
        response += scoreComment;

        return sentMsg.edit( response );
    }

};
