const RandomGameCommand = require('../../structures/RandomGameCommand.js');

const gameURL = 'https://retroachievements.org/game';

module.exports = class WhatGameCommand extends RandomGameCommand {
  constructor(client) {
    super(client, {
      name: 'whatgame',
      aliases: ['wg', 'randomgame'],
      group: 'random',
      memberName: 'whatgame',
      description: 'Responds with a random game that has achievements.',
      examples: ['`whatgame`', '`whatgame nes`', '`whatgame "street fighter"`', '`whatgame megadrive`'],
      args: [
        {
          key: 'terms',
          prompt: '',
          type: 'string',
          // infinite: true, // there's a Commando bug with infinite+default
          default: '~NOARGS~',
        },
      ],
    });
  }

  run(msg, { terms }) {
    const chosenGame = this.getRandomGame(terms);

    if (!chosenGame || !chosenGame instanceof Array || chosenGame.length == 0) return msg.reply("Didn't find anything... :frowning:");

    return msg.reply(`**${chosenGame[1]}**\n${gameURL}/${chosenGame[0]}`);
  }
};
