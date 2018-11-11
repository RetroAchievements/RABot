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
                    //default: '~NOARGS~',
                },
            ],
        });
    }

    async run(msg, { user }) {
        const sentMsg = await msg.reply(':hourglass: Getting info, please wait...');
        const response = await bestdays( user );
        return sentMsg.edit( response );
    }

};
