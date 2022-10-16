const Command = require('./Command');
const { gameList, consoles } = require('../util/GetGameList');

module.exports = class RandomGameCommand extends Command {
  pickGame(games) {
    if (!(games instanceof Array) || games.length === 0) return undefined;

    return games[Math.floor(Math.random() * games.length)];
  }

  getRandomGame(terms) {
    // picking a random game globally
    if (terms === '~NOARGS~') return this.pickGame(gameList.games);

    let games;
    const term = terms.toLowerCase();
    let offset;
    let length;

    // if the search term is a console name, pick a random game from that console
    if (consoles.includes(term)) {
      const { index } = gameList;
      const consoleName = term;
      offset = index[consoleName][0];
      length = index[consoleName][1];
      games = gameList.games.slice(offset, offset + length);
      return this.pickGame(games);
    }

    let regex;
    try {
      regex = new RegExp(term, 'i');
    } catch (err) {
      return `invalid Regular Expression: \`${term}\``;
    }
    games = gameList.games;
    games = games.filter((entry) => entry[1].match(regex));

    return this.pickGame(games);
  }
};
