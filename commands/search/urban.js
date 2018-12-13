/*
 * The inspiration for this came from Xiao bot's code:
 * https://github.com/dragonfire535/xiao
 */
const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');
const request = require('node-superfetch');
const { shorten } = require('../../util/Utils');

module.exports = class UrbanCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'urban',
			aliases: ['urban-dictionary', 'ud'],
			group: 'search',
			memberName: 'urban',
			description: 'Defines a word, but with Urban Dictionary.',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					key: 'word',
					prompt: 'What word would you like to look up?',
					type: 'string'
				}
			]
		});
	}

	async run(msg, { word }) {
        const sentMsg = await msg.reply(':hourglass: Getting info, please wait...');

		try {
			const { body } = await request
				.get('http://api.urbandictionary.com/v0/define')
				.query({ term: word });

			if (!body.list.length)
                return msg.say('Could not find any results.');

			const data = body.list[0];

			const response = new RichEmbed()
				.setColor(0x32A8F0)
				.setAuthor('Urban Dictionary', 'https://i.imgur.com/Fo0nRTe.png', 'https://www.urbandictionary.com/')
				.setURL(data.permalink)
				.setTitle(data.word)
				.setDescription(shorten(data.definition.replace(/\[|\]/g, '')))
				.setFooter(`👍 ${data.thumbs_up} 👎 ${data.thumbs_down}`)
				.setTimestamp(new Date(data.written_on))
				.addField('Example', data.example ? shorten(data.example.replace(/\[|\]/g, ''), 1000) : 'None');
			return sentMsg.edit(response);
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};
