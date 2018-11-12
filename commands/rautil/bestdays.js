const Command = require('../../structures/Command.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { bestDays } = require('../../util/Utils.js');

module.exports = class BestDaysCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bestdays',
            group: 'rautil',
            memberName: 'bestdays',
            description: 'Get the info about the "best RA days" of an user',
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
        const bestDaysInfo = await bestDays( user, days );
        if( !bestDaysInfo )
            sentMsg.edit(`There's no info for \`${user}\``);

        let response = `:trophy: __**${user}'s best days**__ :trophy:\n`;
        response += '```md\n';

        for(let i = 1; i <= days && i < bestDaysInfo.length; i++) {
            response += `\n[${bestDaysInfo.date[i]}]`;
            response += `( ${bestDaysInfo.cheevos[i]} ) `;
            response += `< ${bestDaysInfo.score[i]} >`;
        }
        response += '\n```';

        const botComment = await bestScoreComment( user );
        if( botComment )
            response += scoreComment;

        return sentMsg.edit( response );
    }

};
