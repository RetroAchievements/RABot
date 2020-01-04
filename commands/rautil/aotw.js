const Command = require('../../structures/Command.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class AotwCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'aotw',
            group: 'rautil',
            memberName: 'aotw',
            description: 'Show the current Achievement of the Week and the recent winners.',
            examples: ['`aotw`, `aotw 2018-05-29`'],
            throttling: {
                usages: 2,
                duration: 120,
            },
            argsPromptLimit: 0,
            args: [
                {
                    key: 'date',
                    type: 'string',
                    prompt: '',
                    default: '0',
                    validate: date => {
                        const errMsg = '**Invalid date!**\n'
                        const myDate = new Date(date);

                        // is it a valid date?
                        if(myDate instanceof Date && !isNaN(myDate)) {
                            // future?
                            if(Date.now() - myDate > 0)
                                return true;
                            return `${errMsg}It must be something before now.`;
                        }
                        return `${errMsg}Try something like \`2018-06-27\`.`
                    }, // end of validate
                },
            ], // end of list of args
        });
    }

    async run(msg, { date }) {
        const site = 'https://retroachievements.org';
        const max = 20;
        const since = new Date(date);
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
                    let winDate
                    let response = `:trophy: __**Achievement of the Week**__ :trophy:\n${aotwUrl}`;
                    response += `\n\n**Recent Winners** (max ${max}):\n`;
                    response += '```md\n';

                    const winners = $('#recentwinners').find('tr').map( (i, element) => ({
                        user: $(element).find('td:nth-of-type(2)').text().trim(),
                        hardcore: $(element).find('td:nth-of-type(3)').text().trim(),
                        date: $(element).find('td:nth-of-type(4)').text().trim(),
                    })).get();

                    for(let i = 1; i <= max && i < winners.length; i++) {
                        winDate = new Date(winners[i].date);
                        if(!date || winDate - since < 0)
                            break

                        response += `\n[${winners[i].date}]`;
                        response += `( ${winners[i].user} ) `;
                        response += winners[i].hardcore.includes('ardcore') ? '<hardcore> +1' : '+0.5';
                    }
                    response += '\n```\n';

                    return sentMsg.edit(response);
                })
            })
        .catch(res => {
            return sentMsg.edit('Ouch! :frowning2:\nAn error occurred:```' + res + '```Please, contact a @mod.');
        });
    }

};
