const Command = require('../../structures/Command');

module.exports = class GoodnightCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'goodnight',
            aliases: ['gn', 'gnight', 'nighty', 'night'],
            group: 'single',
            memberName: 'goodnight',
            description: 'Good night.'
        });
    }

    async run(msg) {
        try {
            await msg.react('😴');
            return msg.reply('sleep well... 😴');
        } catch (err) {
            return msg.reply('sleep well... 😴');
        }
    }
};
