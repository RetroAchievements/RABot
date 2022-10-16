const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const Command = require('../../structures/Command');
const { shorten } = require('../../util/Utils');

module.exports = class BulbapediaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bulbapedia',
      group: 'search',
      memberName: 'bulbapedia',
      description: 'Searches Bulbapedia for your query.',
      clientPermissions: ['EMBED_LINKS'],
      args: [
        {
          key: 'query',
          prompt: 'What article would you like to search for?',
          type: 'string',
        },
      ],
    });
  }

  async run(msg, { query }) {
    const sentMsg = await msg.reply(':hourglass: Getting info, please wait...');

    try {
      const { body } = await request
        .get('https://bulbapedia.bulbagarden.net/w/api.php')
        .query({
          action: 'query',
          prop: 'extracts|pageimages',
          format: 'json',
          titles: query,
          exintro: '',
          explaintext: '',
          pithumbsize: 150,
          redirects: '',
          formatversion: 2,
        });
      const data = body.query.pages[0];

      if (data.missing) return sentMsg.edit("Didn't find anything... :frowning:");

      const response = new MessageEmbed()
        .setColor(0x3E7614)
        .setTitle(data.title)
        .setAuthor('Bulbapedia', 'https://i.imgur.com/ePpoeFA.png', 'https://bulbapedia.bulbagarden.net/')
        .setThumbnail(data.thumbnail ? data.thumbnail.source : null)
        .setURL(`https://bulbapedia.bulbagarden.net/wiki/${encodeURIComponent(query).replace(/\)/g, '%29')}`)
        .setDescription(shorten(data.extract.replace(/\n/g, '\n\n')));
      return sentMsg.edit(response);
    } catch (err) {
      return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
    }
  }
};
