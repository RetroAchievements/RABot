/*
 * The inspiration for this came from Xiao bot's code:
 * https://github.com/dragonfire535/xiao
 */
const Command = require('../../structures/Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { shorten } = require('../../util/Utils.js');

module.exports = class WikipediaCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'wikipedia',
            aliases: ['wp', 'wikip'],
            group: 'search',
            memberName: 'wikipedia',
            description: 'Searches Wikipedia for your query.',
            clientPermissions: ['EMBED_LINKS'],
            args: [
                {
                    key: 'query',
                    prompt: 'What article would you like to search for?',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { query }) {
        const sentMsg = await msg.reply(':hourglass: Getting wikipedia info, please wait...');

        try {
            let params = [
                `search=${encodeURI(query)}`,
                'action=opensearch',
                'format=json',
                'limit=1',
                'namespace=0'
            ];

            let res = await fetch('https://en.wikipedia.org/w/api.php?' + params.join('&'));
            let body = await res.json();
            query = body[1][0];

            params = [
                `titles=${encodeURI(query)}`,
                'action=query',
                'prop=extracts|pageimages',
                'format=json',
                'exintro=',
                'explaintext=',
                'pithumbsize=150',
                'redirects=',
                'formatversion=2'
            ];

            res = await fetch('https://en.wikipedia.org/w/api.php?' + params.join('&'));
            body = await res.json();
            const data = body.query.pages[0];

            if (data.missing)
                return sentMsg.edit("Didn't find anything... :frowning:");

            return sentMsg.edit(
                `__**From:**__ <https://en.wikipedia.org/wiki/${encodeURIComponent(data.title).replace(/\)/g, '%29')}>` +
                '```' +
                shorten(data.extract.replace(/\n/g, '\n\n'), 1000) +
                '```'
            );
        } catch (err) {
            return sentMsg.edit(`**Whoops! Something went wrong!**\n\`${err.message}\``);
        }
    }
};
