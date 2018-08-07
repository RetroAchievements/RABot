const Command = require('../../structures/Command');

module.exports = class PanicCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'panic',
            group: 'single',
            memberName: 'panic',
            description: 'What to do when the site is down!'
        });
    }

    async run(msg) {
        const response = "😱\n**OH MY GOD!!! SOMETHING IS WRONG WITH THE SITE?!?! THE SITE IS DOWN?!?**!\n\nDon't panic mate. The problem will be solved at some point.\n\nWhile you can't earn cheevos, why not doing something in real life or maybe just chatting on " +
            this.client.channels.get('464947132017803284');

        try {
            await msg.react('😱');
            return msg.reply(response);
        } catch (err) {
            return msg.reply(response);
        }
    }
};
