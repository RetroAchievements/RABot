const fetch = require('node-fetch');
const Command = require('../../structures/Command');

module.exports = class DadJokesCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'dadjoke',
      aliases: ['dj'],
      group: 'random',
      memberName: 'dadjoke',
      description: 'Gets a random dadjoke from <https://icanhazdadjoke.com/>.',
      examples: ['`dadjoke`', '`dj`', '`dj dog`'],
      throttling: {
        usages: 5,
        duration: 120,
      },
    });
  }

  async run(msg) {
    const sentMsg = await msg.reply(':man: I\'m getting a joke, please wait...');

    const res = await fetch('https://icanhazdadjoke.com/', {
      headers: { Accept: 'application/json' },
    });
    const json = await res.json();

    return sentMsg.edit(json.joke);
  }
};
