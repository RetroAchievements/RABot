const GoogleCommand = require('../../structures/GoogleCommand.js');

const site = "retroachievements.org/game";
const regex = /retroachievements\.org\/game\/[0-9]+/i;


module.exports = class RAGameCommand extends GoogleCommand {
    constructor(client) {
        super(client, {
            name: 'ragame',
            aliases: ['rgame', 'game'],
            group: 'search',
            memberName: 'ragame',
            description: 'Google for a game at RetroAchievements.org and show the link.',
            examples: ['`ragame street fighter mega drive`', '`ragame final fight arcade`' ],
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
        }, site, regex);
    }

};
