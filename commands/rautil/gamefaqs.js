const GoogleCommand = require('../../structures/GoogleCommand.js');

const site = "gamefaqs.com";
const regex = /www\.gamefaqs\.com\/(?!boards)[^\/]+\/[^"&\/]+/;


module.exports = class GamefaqsCommand extends GoogleCommand {
    constructor(client) {
        super(client, {
            name: 'gamefaqs',
            aliases: ['gamefaq', 'gfaqs', 'gfaq', 'gf'],
            group: 'rautil',
            memberName: 'gamefaqs',
            description: 'Google for a game at GameFAQs and show the link.',
            examples: ['`gamefaqs street fighter mega drive`', '`gamefaqs final fight arcade`' ],
            args: [
                {
                    key: 'terms',
                    prompt: '',
                    type: 'string',
                    infinite: true,
                    default: '1',
                },
            ]
        }, site, regex);
    }

};
