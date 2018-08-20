const Command = require('../../structures/Command.js');
const funfacts = require('../../assets/json/funfacts.json');

module.exports = class FunFactCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'funfact',
            aliases: ['ffact', 'funf'],
            group: 'single',
            memberName: 'funfact',
            description: 'Responds with a retrogaming fun fact.',
            throttling: {
                usages: 5,
                duration: 60,
            },
        });
    }

    run(msg) {
        return msg.say('**' + funfacts[Math.floor(Math.random() * funfacts.length)] + '**');
    }
};
