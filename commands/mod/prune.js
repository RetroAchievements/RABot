const Command = require('../../structures/Command');

const {
  CHANNEL_BOTGAMES, CHANNEL_BOTSPAM, CHANNEL_HOTBOX, CHANNEL_STREAMING_TEXT,
} = process.env;

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
        duration: 10,
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
          max: 99,
        },
      ],
    });
  }

  async run(msg, { count }) {
    let isAllowed = false;

    switch (msg.channel.id) {
      case CHANNEL_BOTGAMES:
      case CHANNEL_BOTSPAM:
      case CHANNEL_HOTBOX:
      case CHANNEL_STREAMING_TEXT:
        isAllowed = true;
        break;
      default:
        isAllowed = false;
    }

    if (!isAllowed) {
      return msg.reply('This command is not available in this channel');
    }

    try {
      const messages = await msg.channel.fetchMessages({ limit: count + 1 });
      await msg.channel.bulkDelete(messages, true);
      return null;
    } catch (err) {
      return msg.reply(err.message);
    }
  }
};
