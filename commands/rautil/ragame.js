const Command = require('../../structures/Command.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class RAGameCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ragame',
            aliases: ['rgame', 'rg'],
            group: 'rautil',
            memberName: 'ragame',
            description: 'Google for a game at RetroAchievements.org and show the link (you can also give the game ID to get the respective link).',
            examples: ['`ragame street fighter mega drive`', '`ragame final fight arcade`', '`ragame 1` <- using the game ID' ],
            throttling: {
                usages: 5,
                duration: 60,
            },
            args: [
                {
                    key: 'terms',
                    prompt: '',
                    type: 'string',
                    infinite: true,
                    default: '1',
                },
            ]
        });
    }

    async run(msg, { terms } ) {
        let searchURL = 'https://www.google.com/search?q=site:retroachievements.org/game';
        let response;

        // if it's only a number, then it's considered a game ID
        if(terms.length == 1 && !isNaN(terms[0]))
            return msg.reply('https://retroachievements.org/Game/' + terms[0]);

        terms.forEach(term => searchURL += `+${term}`);

        const sentMsg = await msg.reply(':mag: Googling your game, please wait...');

        fetch(encodeURI(searchURL))
            .then(res => res.text())
            .then(body => {
                const $ = cheerio.load(body);
                response = $('h3.r').toString().match(/retroachievements.org\/[Gg]ame\/[0-9]+/);
                response = response ? `https://${response}` : "Game not found... :frowning:";
                return sentMsg.edit(msg.author + ', ' + response);
            })
            .catch(res => {
                sentMsg.edit(msg.author + '**`ragame` error**: Something went wrong...');
                console.error(res);
            });
    }

};
