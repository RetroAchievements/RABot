const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');

const { CHANNEL_MEME, MAX_MEMES } = process.env;

module.exports = class MemeFactCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'memefact',
      aliases: ['meme'],
      group: 'random',
      memberName: 'memefact',
      description: 'Responds with a RetroAchievements meme fact.',
      guildOnly: true,
      argsPromptLimit: 0,
      args: [
        {
          key: 'number',
          prompt: '',
          type: 'integer',
          default: '-1',
        },
      ],
    });
  }

  async run(msg, { number }) {
    const memeChannel = msg.guild.channels.get(CHANNEL_MEME);
    if (!memeChannel) return msg.channel.send('It appears that you do not have a meme-board channel.');

    const memes = await memeChannel.fetchMessages({ limit: MAX_MEMES });
    const count = memes.size;
    if (count < 1) return msg.reply(`It appears that there isn't any meme on the ${memeChannel}.`);

    let originalMemeEmbed;
    let memeEmbed;
    if (number < 1 || number > count) {
      originalMemeEmbed = memes.random().embeds[0];
      memeEmbed = new MessageEmbed(originalMemeEmbed).addField('-', `random meme | see more in ${memeChannel}`);
    } else {
      originalMemeEmbed = memes.array()[count - number].embeds[0];
      memeEmbed = new MessageEmbed(originalMemeEmbed).addField('-', `meme #${number} | see more in ${memeChannel}`);
    }

    return msg.embed(memeEmbed);
  }
};
