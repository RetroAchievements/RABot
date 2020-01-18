const Command = require('../../structures/Command');

module.exports = class PanicCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'about',
            aliases: ['rabot'],
            group: 'single',
            memberName: 'about',
            description: 'Show info about me.',
        });
    }

    async run(msg) {
        const response = "\n:robot:- `Hi! I'm the official RetroAchievements bot.`\n"
            + 'I am powered by Discord.js/Commando.\n'
            + 'If you know these nerdy stuff and would like to improve me, check my code in\n'
            + '<https://github.com/RetroAchievements/RABot>\n'
            + 'Feedback and feature requests go in\n'
            + '<https://github.com/RetroAchievements/RABot/issues>';

        try {
            await msg.react('🤖');
            return msg.reply(response);
        } catch (err) {
            return msg.reply(response);
        }
    }
};
