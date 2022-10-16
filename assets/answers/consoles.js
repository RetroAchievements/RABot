// TODO: this will change on RAWeb v2
const site = 'https://retroachievements.org/gameList.php?c=';

const megadrive = 1;
const n64 = 2;
const snes = 3;
const gb = 4;
const gba = 5;
const gbc = 6;
const nes = 7;
const pcengine = 8;
// const segacd = 9;
// const sega32x = 10;
const mastersystem = 11;
// const psx = 12;
// const atarilynx = 13;
const ngp = 14;
const gamegear = 15;
// const gamecube = 16;
// const jaguar = 17;
// const nds = 18;
// const wii = 19;
// const wiiu = 20;
// const ps2 = 21;
// const xbox = 22;
// const skynet = 23;
// const xone = 24;
const atari2600 = 25;
// const dos = 26;
const arcade = 27;
const virtualboy = 28;
// const msx = 29;
// const commodore64 = 30;
// const zx81 = 31;

module.exports = {
  site,

  pages: {
    all: site,

    megadrive,
    md: megadrive,
    smd: megadrive,
    genesis: megadrive,
    gen: megadrive,

    n64,
    nintendo64: n64,

    snes,
    supernintendo: snes,

    gb,
    gameboy: gb,

    gba,
    gameboyadvance: gba,

    gbc,
    gameboycolor: gbc,

    nes,

    pcengine,
    turbografx: pcengine,
    turbografx16: pcengine,

    mastersystem,
    sms: mastersystem,

    ngp,
    neogeopocket: ngp,
    ngpc: ngp,
    neogeopocketcolor: ngp,

    gamegear,
    gg: gamegear,

    atari2600,
    vcs: atari2600,
    atari: atari2600,

    arcade,
    fba: arcade,

    virtualboy,
    vb: virtualboy,
  },

  answers: {
    default: site,
  },
};
