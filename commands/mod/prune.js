const Command = require('../../structures/Command');
const { CHANNEL_BOTGAMES, CHANNEL_BOTSPAM } = process.env;


module.exports = class PruneCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'prune',
            aliases: ['clear'],
            group: 'mod',
            memberName: 'prune',
            description: 'Deletes up to 99 messages from the current channel.',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 10
            },
            clientPermissions: ['READ_MESSAGE_HISTORY', 'MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            args: [
                {
                    key: 'count',
                    label: 'amount of messages',
                    prompt: 'How many messages do you want to delete? Limit of up to 99.',
                    type: 'integer',
                    default: 1,
                    min: 1,
                    max: 99
                }
            ]
        });
    }

    async run(msg, { count }) {
        if (msg.channel.id !== CHANNEL_BOTGAMES && msg.channel.id !== CHANNEL_BOTSPAM)
            return msg.reply(`This command is only available to be used in ${this.client.channels.get(CHANNEL_BOTGAMES)} and ${this.client.channels.get(CHANNEL_BOTSPAM)}`);

        try {
            const messages = await msg.channel.fetchMessages({ limit: count + 1 });
            await msg.channel.bulkDelete(messages, true);
            return null;
        } catch (err) {
            return msg.reply(err.message);
        }
    }
};
