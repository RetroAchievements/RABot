const RandomFactCommand = require('../../structures/RandomFactCommand.js');

module.exports = class MemeFactCommand extends RandomFactCommand {
    constructor(client) {
        super(client, {
            name: 'memefact',
            aliases: ['meme'],
            group: 'single',
            memberName: 'memefact',
            description: 'Responds with a RetroAchievements meme fact.',
            args: [
                {
                    key: 'number',
                    prompt: '',
                    type: 'string',
                    default: '~NOARGS~'
                }
            ]
        }, '../assets/json/memefacts.json' );

    }
};
