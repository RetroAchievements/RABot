// inspiration: https://github.com/dragonfire535/xiao/blob/master/commands/info/channel.js
const Command = require('../../structures/Command');

module.exports = class TopicCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'topic',
            group: 'single',
            memberName: 'topic',
            description: 'Responds with the channel\'s topic.',
            clientPermissions: ['EMBED_LINKS'],
        });
    }

    run(msg) {
        const channel = msg.channel.type === 'dm' ? `@${msg.channel.recipient.username}` : msg.channel;
        const topic = channel.topic || ' ';
        return msg.say(channel + "'s topic:\n**```" + topic + "```**");
    }
};
