/* eslint-disable no-await-in-loop */
const Canvas = require('canvas');
const { buildAuthorization, getGameExtended } = require('@retroachievements/api');
// const { MessageAttachment } = require('discord.js'); // <-- this works only on djs v12
const { Attachment } = require('discord.js');

const Command = require('../../structures/Command');

const { RA_USER, RA_WEB_API_KEY } = process.env;

// TODO: this kind of info seems to fit better in the /assets directory...
const abbreviations = {
  '3DO Interactive Multiplayer': '3DO',
  'Apple II': 'AII',
  Arcade: 'Arc',
  'Atari 2600': '2600',
  'Atari 7800': '7800',
  'Atari Jaguar': 'Jag',
  'Atari Lynx': 'Lynx',
  ColecoVision: 'Col',
  Dreamcast: 'DC',
  'Game Boy Advance': 'GBA',
  'Game Boy Color': 'GBC',
  'Game Boy': 'GB',
  'Game Gear': 'GG',
  Intellivision: 'INTV',
  'Magnavox Odyssey 2': 'MO2',
  'Master System': 'SMS',
  'Mega Drive': 'MD',
  'Neo Geo Pocket': 'NGP',
  'Nintendo 64': 'N64',
  'Nintendo DS': 'DS',
  'PC Engine': 'PCE',
  'PC-8000/8800': 'PC88',
  'PlayStation Portable': 'PSP',
  PlayStation: 'PS1',
  'Pokemon Mini': 'PM',
  Saturn: 'SAT',
  'Sega CD': 'SCD',
  'SG-1000': 'SG',
  Vectrex: 'VTX',
  'Virtual Boy': 'VB',
  'Watara Supervision': 'WSV',
  WonderSwan: 'WS',
};

module.exports = class HotCheevsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hotcheevs',
      aliases: ['hc'],
      group: 'rautil',
      memberName: 'hotcheevs',
      description: 'Get **six** game IDs and create a HotCheevs Flash template to post on the site.',
      examples: ['`hotcheevs 218 1012 4650 8170 587 64`'],
      throttling: {
        usages: 5,
        duration: 120,
      },
      argsPromptLimit: 0,
      args: [
        {
          key: 'gameIds',
          type: 'string',
          prompt: '',
          infinite: true,
          default: '~NO~OPTS~',
        },
      ],
    });
  }

  async run(msg, { gameIds }) {
    // ugly workaround to deal with the peculiarities of Nintendo DS titlescreens
    let orientationDS = null;
    if (gameIds[0] === '--ds') {
      gameIds.shift();
      orientationDS = gameIds.shift();
    }

    if (gameIds.length < 6) {
      return msg.reply(':octagonal_sign: **Whooops!**\nPlease, give me exactly six game IDs!');
    }

    const sentMsg = await msg.say(':hourglass: Getting info, please wait...');

    const templateMsg = ['```html\n'];

    const canvas = Canvas.createCanvas(468, 220);
    const ctx = canvas.getContext('2d');
    const grid = { width: 156, height: 110 };

    try {
      for (let i = 0; i < gameIds.length && i < 6; i += 1) {
        const gameId = Number.parseInt(gameIds[i], 10);
        if (gameId <= 0) {
          return sentMsg.edit(`**ERROR**: invalid game ID: \`${gameIds[i]}\``);
        }

        const authorization = buildAuthorization({
          userName: RA_USER,
          webApiKey: RA_WEB_API_KEY,
        });
        const gameExtended = await getGameExtended(authorization, { gameId });

        const gameUri = `/game/${gameExtended.id}`;
        const gameTitle = `${gameExtended.title} (${abbreviations[gameExtended.consoleName] || gameExtended.consoleName})`;

        const authorSet = new Set();
        const dates = new Set();

        for (const achievement of Object.values(gameExtended.achievements)) {
          authorSet.add(achievement.author);
          dates.add(achievement.dateCreated.replace(/ ..:..:..$/, ''));
        }

        const authorsMsg = [];
        [...authorSet].map((author) => authorsMsg.push(`<a href="/user/${author}">${author}</a>`));

        const releaseDate = [...dates].reduce((d1, d2) => {
          const date1 = new Date(d1);
          const date2 = new Date(d2);
          return date1 >= date2 ? d1 : d2;
        });

        templateMsg.push(`${releaseDate.replace(/-/g, '.')} <a href="${gameUri}">${gameTitle}</a> by ${authorsMsg.join(' and ')}<br />\n\n`);

        // creating the HotCheevs background
        const titleScreenUrl = `https://retroachievements.org${gameExtended.imageTitle}`;
        const titleScreen = await Canvas.loadImage(titleScreenUrl);

        // titleScreen position in the hotcheevs background grid image
        const imgX = (i % 3) * grid.width;
        const imgY = Math.trunc(i / 3) * grid.height;

        // Nintendo DS title screens needs an extra care
        if (gameExtended.consoleName === 'Nintendo DS') {
          let sourceX;
          let sourceY;
          let imgWidth;
          let imgHeight;

          switch (orientationDS) {
            case 'full':
              sourceX = 0;
              sourceY = 0;
              imgWidth = titleScreen.width;
              imgHeight = titleScreen.height;
              break;
            case 'left':
              sourceX = 0;
              sourceY = 0;
              imgWidth = titleScreen.width / 2;
              imgHeight = titleScreen.height;
              break;
            case 'right':
              sourceX = titleScreen.width / 2;
              sourceY = 0;
              imgWidth = titleScreen.width / 2;
              imgHeight = titleScreen.height;
              break;
            case 'bottom':
              sourceX = 0;
              sourceY = titleScreen.height / 2;
              imgWidth = titleScreen.width;
              imgHeight = titleScreen.height / 2;
              break;
            case 'top':
            default:
              sourceX = 0;
              sourceY = 0;
              imgWidth = titleScreen.width;
              imgHeight = titleScreen.height / 2;
              break;
          }

          ctx.drawImage(
            titleScreen,
            sourceX,
            sourceY,
            imgWidth,
            imgHeight,
            imgX,
            imgY,
            grid.width,
            grid.height,
          );
        } else {
          ctx.drawImage(
            titleScreen,
            imgX,
            imgY,
            grid.width,
            grid.height,
          );
        }
      }
    } catch (error) {
      return sentMsg.edit(`**Whoops!** Something went wrong! :frowning:\nAre you sure the game IDs are valid?\n**ERROR MESSAGE**:\`${error.message}\``);
    }

    sentMsg.edit(':white_check_mark: **DONE!**');

    // closing the message template
    templateMsg.push('```');
    msg.reply(`Here's the post template:${templateMsg.join('')}`);

    // attaching the generated image
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, 468, 220);
    const hotCheevsBackground = new Attachment(canvas.toBuffer(), 'hotcheevs.png');

    return msg.say('And here\'s the HotCheevs background:', hotCheevsBackground);
  }
};
