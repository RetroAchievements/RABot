const ytSearch = require('youtube-search');
const Command = require('../../structures/Command');

const { YOUTUBE_API_KEY } = process.env;

const opts = {
  maxResults: 1,
  key: YOUTUBE_API_KEY,
};

module.exports = class YoutubeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'youtube',
      aliases: ['yt'],
      group: 'search',
      memberName: 'youtube',
      description: 'Search for a video on youtube and post the first one found.',
      examples: ['`youtube meleu 10 manobras`', '`yt brujeria la migra`'],
      throttling: {
        usages: 3,
        duration: 60,
      },
      args: [
        {
          key: 'terms',
          prompt: '',
          type: 'string',
          infinite: true,
        },
      ],
    });
  }

  async run(msg, { terms }) {
    const searchTerms = terms.join(' ');

    const sentMsg = await msg.reply(':mag: Searching for your video, please wait...');

    ytSearch(searchTerms, opts, (err, results) => {
      if (err) {
        return sentMsg.edit(`${msg.author}, **error**: Something went wrong...`);
      }

      if (!results) {
        return sentMsg.edit(`${msg.author} , Didn't find anything... :frowning:`);
      }

      return sentMsg.edit(`${msg.author}, ${results[0].link}`);
    });
  }
};
