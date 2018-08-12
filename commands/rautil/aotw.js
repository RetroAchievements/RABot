const Command = require('../../structures/Command.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class AotwCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'aotw',
            group: 'rautil',
            memberName: 'aotw',
            description: 'Show the current Achievement of the Week and the recent 10 winners.',
            examples: ['`aotw`'],
            throttling: {
                usages: 1,
                duration: 120,
            },
        });
    }

    async run(msg) {
        const site = 'https://retroachievements.org';
        let aotwUrl = site;

        const sentMsg = await msg.reply(':hourglass: Getting AotW info, please wait...');

        fetch(site)
            .then(res => res.text())
            .then(body => {
                const $ = cheerio.load(body);
                // XXX: not sure if it'll work with RAWeb v2
                aotwUrl += $('#aotwbox').find('a').attr('href');
            })
            .then(() => {
                fetch(aotwUrl)
                .then(res => res.text())
                .then(body => {
                    const $ = cheerio.load(body);
                    let i = 0;
                    let response = `:trophy: __**Achievement of the Week**__ :trophy:\n${aotwUrl}`;
                    response += `\n\n**Recent Hardcore Winners** (max 10):\n`;
                    response += '```md';

                    $('#recentwinners').find('tr')
                    .each(function() {
                        // XXX: not sure if it'll work with RAWeb v2
                        if( $(this).find('span.hardcore').text() ) {
                            response += `\n[${$(this).find('small').text()}]`;
                            response += `( ${$(this).find('img').attr('title')} )`;
                            if(++i >= 10) {
                                response += '\n```\n';
                                return false;
                            }
                        }
                    });
                    sentMsg.edit(response);
                })
            });
    }

};
