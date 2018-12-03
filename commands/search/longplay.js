const Command = require('../../structures/Command.js');
const ytSearch = require('youtube-search');

require('dotenv').config({path: __dirname + '../../.env'});
const { YOUTUBE_API_KEY } = process.env;

const opts = {
    maxResults: 1,
    key: YOUTUBE_API_KEY
};


module.exports = class LongPlayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'longplay',
            aliases: ['lplay', 'lp'],
            group: 'search',
            memberName: 'longplay',
            description: 'Search for a longplay video on youtube and post the link.',
            examples: ['`longplay street fighter mega drive`', '`longplay final fight arcade`' ],
            throttling: {
                usages: 3,
                duration: 60,
            },
            args: [
                {
                    key: 'terms',
                    prompt: '',
                    type: 'string',
                    infinite: true,
                },
            ]
        });
    }

    async run(msg, { terms } ) {
        let searchTerms = 'longplay'
        let response;

        terms.forEach(term => searchTerms += ` ${term}`);

        const sentMsg = await msg.reply(":mag: Searching the longplay, please wait...");

        ytSearch(searchTerms, opts, (err, results) => {
            if(err)
                return sentMsg.edit(`${msg.author}, **error**: Something went wrong...`);
            if(!results)
                return sentMsg.edit(`${msg.author} , Didn't find anything... :frowning:`);
            return sentMsg.edit(`${msg.author}, ${results[0].link}`); 
        });
    }

};

