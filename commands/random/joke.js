const fetch = require('node-fetch');
const Command = require('../../structures/Command');

module.exports = class JokeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'joke',
      aliases: ['jk'],
      group: 'random',
      memberName: 'joke',
      description: 'Gets a random joke from <https://sv443.net/jokeapi/v2/>.',
      examples: ['`joke`', '`jk`', '`jk dog`', '`jk programmer`'],
      throttling: {
        usages: 5,
        duration: 120,
      },
      argsPromptLimit: 0,
      args: [
        {
          key: 'terms',
          prompt: '',
          type: 'string',
          default: '~NOARGS~',
        },
      ],
    });
  }

  async run(msg, { terms }) {
    let sentMsg;
    try {
      sentMsg = await msg.reply(':man: I\'m getting a joke, please wait...');
      const apiUrl = 'https://sv443.net/jokeapi/v2/joke/Any?blacklistFlags=nsfw,racist,sexist';
      let searchFilter = '';

      if (terms !== '~NOARGS~') {
        searchFilter = `&contains=${encodeURI(terms)}`;
      }

      const res = await fetch(apiUrl + searchFilter);
      const json = await res.json();

      if (json.error) {
        return sentMsg.edit(json.message);
      }

      let jokeString;

      if (json.setup) {
        jokeString = `${json.setup}...\n||${json.delivery}||`;
      } else {
        jokeString = json.joke;
      }

      return sentMsg.edit(jokeString);
    } catch (error) {
      return sentMsg.edit('**Whoops!** Something went wrong!');
    }
  }
};
