const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Command = require('../../structures/Command.js');

const url = 'https://www.vgmaps.com/Atlas/';

const vgmapsConsole = {
    megadrive: 'Genesis',
    mastersystem: 'MasterSystem',
    gamegear: 'GameGear',

    nes: 'NES',
    snes: 'SuperNES',
    gb: 'GB-GBC',
    gbc: 'GB-GBC',
    gba: 'GBA',
    n64: 'N64',
    vb: 'VirtualBoy',

    pcengine: 'TG16',

    ngp: 'NGP-NGPC',
    ngpc: 'NGP-NGPC',

    atari2600: 'Atari2600',
    atari7800: 'Atari7800',
    //    lynx:

    arcade: 'Arcade',
};
const consoleList = `\`${Object.keys(vgmapsConsole).join('`, `')}\``;

module.exports = class VGMapsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'vgmaps',
            aliases: ['vgmap'],
            group: 'search',
            memberName: 'vgmaps',
            description: "Searches vgmaps.com for a video game's map.",
            examples: ['`vgmaps gba zelda`', '`vgmaps megadrive bonanza`'],
            details: `__Available console systems__: ${consoleList}`,
            guildOnly: true, // XXX: maybe remove this limitation later
            throttling: { usages: 3, duration: 120 }, // TODO: optimize the script to cache the html file
            clientPermssions: ['EMBED_LINKS'],
            argsPromptLimit: 2,
            args: [
                {
                    key: 'system',
                    prompt: `The game is from which console system?\n**Options**: ${consoleList}.`,
                    type: 'string',
                    validate: (sys) => {
                        const value = sys.toLowerCase();
                        if (vgmapsConsole[value] || Object.keys(vgmapsConsole).find((key) => vgmapsConsole[key].toLowerCase() === value)) return true;
                        return `Invalid console system, please enter a valid one.\n**Options**: ${consoleList}.`;
                    },
                    parse: (sys) => {
                        const value = sys.toLowerCase();
                        return vgmapsConsole[value];
                    },
                },
                {
                    key: 'game',
                    prompt: 'Do you want to search for maps of which game?',
                    type: 'string',
                    min: 2,
                    max: 100,
                },
            ],
        });
    }


    async run(msg, { system, game }) {
        msg.say(':hourglass: Getting info, please wait...');

        try {
            let failMsg = `**You can try looking directly on the vgmaps page for ${system} games**:\n${url + system}`;
            const res = await fetch(url + system);
            const $ = cheerio.load(await res.text());

            const searchTerm = game.replace(/[^a-zA-Z0-9]/g, '');

            let games = $('table')
                .find(`a[name='${searchTerm}' i]`) // trying the exact match first
                .map((i, elem) => $(elem).attr('name'))
                .get();

            if (games.length < 1) {
                if (searchTerm.length < 3 || searchTerm.length > 100) return msg.say(`Didn't find anything... :frowning:\n${failMsg}`);
                games = $('table')
                    .find(`a[name*='${searchTerm}' i]`)
                    .map((i, elem) => $(elem).attr('name'))
                    .get();

                if (games.length < 1) return msg.say(`Didn't find anything... :frowning:\n${failMsg}`);
            }

            let choice = 0;
            if (games.length > 1) {
                choice = await this.whichOption(msg, games, '__**Games found:**__', failMsg);
                if (choice < 0) return;
            }

            const gameAnchor = games[choice];
            const gameMapsUrl = `${url + system}/index.htm#${gameAnchor}`;
            failMsg = `**You can try looking directly on the vgmaps page**:\n${gameMapsUrl}`;

            const maps = $('table')
                .find(`[name='${gameAnchor}']`)
                .parents('table')
                .find('a')
                .map((i, elem) => {
                    const href = $(elem).attr('href');
                    if (!href) return;
                    if (href.endsWith('.png') || href.endsWith('.jpg')) return href;
                })
                .get();

            if (games.length < 1) return msg.say(`Didn't find any map for ${games[choice]}... :frowning:`);

            choice = 0;
            if (maps.length > 1) {
                choice = await this.whichOption(msg, maps, '__**Maps found:**__', failMsg);
                if (choice < 0) return;
            }

            const map = maps[choice];

            return msg.reply(`**Map:** ${`${url + system}/${map}`}\n**Check here for more maps**: <${gameMapsUrl}>`);
        } catch (err) {
            msg.say(`**Whoops! Something went wrong!**\n\`${err.message}\``);
        }
    }


    /*
     * returns a negative number if choice is invalid.
     * -1 means "time is up!"
     * -2 means "too many options"
     */
    async whichOption(msg, array, title = '', failMsg = '') {
        if (array.length < 1) return -1;

        let prompt = title;

        for (let i = 0; i < array.length; i++) prompt += `\n__**${i + 1}**__. ${array[i]}`;

        if (prompt.length > 1900) {
            msg.say(`Ouch! I'm afraid I can't handle this! :sweat:\n${failMsg}`);
            return -2;
        }

        msg.say(`${prompt}\n**Which option do you choose?**`);

        const filter = (res) => {
            const choice = parseInt(res.content);
            return res.author.id === msg.author.id
                && !isNaN(choice)
                && choice > 0
                && choice < array.length + 1;
        };

        const msgs = await msg.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
        });

        if (!msgs.size) {
            msg.say(`Sorry, time is up!\n${failMsg}`);
            return -1;
        }

        // since it passed the 'filter', it's supposed to be a positive number
        return parseInt(msgs.first().content) - 1;
    }
};
