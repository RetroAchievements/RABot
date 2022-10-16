/*
 * This code is highly based on the work of dragonfire535 and his Xiao bot:
 * https://github.com/dragonfire535/xiao
 */
const request = require('node-superfetch');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const Command = require('../../structures/Command');
const { shorten } = require('../../util/Utils');

const searchGraphQL = stripIndents`
    query ($search: String, $type: MediaType, $isAdult: Boolean) {
        anime: Page (perPage: 1) {
            results: media (type: $type, isAdult: $isAdult, search: $search) { id }
        }
    }
`;
const resultGraphQL = stripIndents`
    query media($id: Int, $type: MediaType) {
        Media(id: $id, type: $type) {
            id
            title { userPreferred }
            coverImage { large }
            startDate { year }
            description
            season
            type
            status
            episodes
            isAdult
            meanScore
        }
    }
`;

module.exports = class AnimeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'anime',
      aliases: ['anilist-anime', 'anilist'],
      group: 'search',
      memberName: 'anime',
      description: 'Searches AniList for your query, getting anime results.',
      clientPermissions: ['EMBED_LINKS'],
      args: [
        {
          key: 'query',
          prompt: 'What anime would you like to search for?',
          type: 'string',
        },
      ],
    });
  }

  async run(msg, { query }) {
    const sentMsg = await msg.reply(':hourglass: Getting info, please wait...');

    try {
      const id = await this.search(query, msg.channel.nsfw);
      if (!id) return sentMsg.edit("Didn't find anything... :frowning:");

      const anime = await this.fetchAnime(id);

      const response = new MessageEmbed()
        .setColor(0x02A9FF)
        .setAuthor('AniList', 'https://i.imgur.com/iUIRC7v.png', 'https://anilist.co/')
        .setURL(`https://anilist.co/anime/${anime.id}`)
        .setThumbnail(anime.coverImage.large || null)
        .setTitle(anime.title.userPreferred)
        .setDescription(anime.description ? shorten(anime.description.replace(/(<br>)+/g, '\n')) : 'No description.')
        .addField('Status', anime.status, true)
        .addField('Episodes', anime.episodes, true)
        .addField('Season', `${anime.season} ${anime.startDate.year}`, true)
        .addField('Average Score', `${anime.meanScore}/100`, true);

      return sentMsg.edit(response);
    } catch (err) {
      return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
    }
  }

  async search(query, nsfw) {
    const { body } = await request
      .post('https://graphql.anilist.co/')
      .send({
        variables: {
          search: query,
          type: 'ANIME',
          isAdult: Boolean(nsfw),
        },
        query: searchGraphQL,
      });
    if (!body.data.anime.results.length) return null;
    return body.data.anime.results[0].id;
  }

  async fetchAnime(id) {
    const { body } = await request
      .post('https://graphql.anilist.co/')
      .send({
        variables: {
          id,
          type: 'ANIME',
        },
        query: resultGraphQL,
      });
    return body.data.Media;
  }
};
