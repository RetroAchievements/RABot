// inspiration: https://github.com/dragonfire535/xiao/blob/master/commands/info/channel.js
const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

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
        const channel = msg.channel;
        const embed = new MessageEmbed()
            .setColor(0x00AE86)
            .setTitle('#' + channel.type === 'dm' ? `@${channel.recipient.username}` : channel.name)
            .addField('topic', channel.topic || '`None`');
        return msg.embed(embed);
    }
};
