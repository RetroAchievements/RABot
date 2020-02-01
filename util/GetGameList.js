const fetch = require('node-fetch');

// const glPath = `${__dirname}/../assets/json`;
// let fs = require('fs');

const gamelist = {
  index: {},
  games: [],
};

const getConsolesURL = 'https://retroachievements.org/dorequest.php?r=officialgameslist&c=';

const consoles = [
  { id: 1, name: 'megadrive' },
  { id: 2, name: 'n64' },
  { id: 3, name: 'snes' },
  { id: 4, name: 'gb' },
  { id: 5, name: 'gba' },
  { id: 6, name: 'gbc' },
  { id: 7, name: 'nes' },
  { id: 8, name: 'pcengine' },
  { id: 9, name: 'segacd' },
  { id: 10, name: 'sega32x' },
  { id: 11, name: 'mastersystem' },
  { id: 12, name: 'psx' },
  { id: 13, name: 'atarilynx' },
  { id: 14, name: 'ngp' },
  { id: 15, name: 'gamegear' },
  // 16: "gamecube",
  { id: 17, name: 'jaguar' },
  { id: 18, name: 'nds' },
  // 19: "wii",
  // 20: "wiiu",
  // 21: "ps2",
  // 22: "xbox",
  // 23: "skynet",
  { id: 24, name: 'pokemonmini' },
  { id: 25, name: 'atari2600' },
  // 26: "dos",
  { id: 27, name: 'arcade' },
  { id: 28, name: 'virtualboy' },
  // 29: "msx",
  // 30: "commodore64",
  // 31: "zx81",
  { id: 33, name: 'sg100' },
  // 34: // VIC-20
  // 35: // Amiga
  // 36: // Atari ST
  // 37: // Amstrad CPC
  { id: 38, name: 'apple2' },
  { id: 39, name: 'saturn' },
  // 40: // Dreamcast
  // 41: // PlayStation Portable
  // 42: // Philips CD-i
  // 43: // 3DO Interactive Multiplayer
  { id: 44, name: 'coleco' },
  // 45: // Intellivision
  // 46: // Vectrex
  { id: 47, name: 'pc88' },
  // 48: // PC-9800
  // 49: // PC-FX
  // 50: // Atari 5200
  { id: 51, name: 'atari7800' },
  // 52: // X68K
  { id: 53, name: 'wonderswan' },
  // 54: // Cassette Vision
  // 55: // Super Cassette Vision
];

async function getConsoles() {
  let tmpIndex = 0;
  let entries;
  await Promise.all(consoles.map(async (c) => {
    const res = await fetch(`${getConsolesURL}${c.id}`);
    const json = await res.json();
    if (json.Success) {
      // decomment below line to write the response into each .json file if still needed
      // fs.writeFile(`${glPath}/gl-${c.name}.json`,jsonData, err => logger.error(err));
      // let jsonFile = require(`${glPath}/gl-${c.name}.json`);

      entries = Object.entries(json.Response);
      gamelist.games = gamelist.games.concat(entries);
      gamelist.index[c.name] = [
        tmpIndex,
        entries.length,
      ];
      tmpIndex += entries.length;
    }
  }));
}

async function getGameList() {
  await getConsoles();
  // update twice a day
  setInterval(await getConsoles, 1000 * 60 * 60 * 12);
}

module.exports.gamelist = gamelist;
module.exports.consoles = (() => {
  const consolesNames = [];
  consoles.forEach((c) => {
    consolesNames.push(c.name);
  });
  return consolesNames;
})();
module.exports.getGameList = getGameList;
