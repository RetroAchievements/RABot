/* eslint-disable no-await-in-loop */
const fetch = require('node-fetch');
const Canvas = require('canvas');
// const { MessageAttachment } = require('discord.js'); // <-- this works only on djs v12
const { Attachment } = require('discord.js');

const Command = require('../../structures/Command.js');

const { RA_USER, RA_WEB_API_KEY } = process.env;

// TODO: this kind of info seems to fit better in the /assets directory...
const abbreviations = {
  'Atari 2600': '2600',
  'Atari 7800': '7800',
  'Atari Jaguar': 'Jag',
  ColecoVision: 'Col',
  'Virtual Boy': 'VB',
  'Nintendo 64': 'N64',
  'SG-1000': 'SG',
  'Master System': 'SMS',
  'Mega Drive': 'MD',
  'Sega CD': 'SCD',
  'Sega Saturn': 'SAT',
  'PC Engine': 'PCE',
  PlayStation: 'PS1',
  Arcade: 'Arc',
  'Apple II': 'AII',
  'PC-8000/8800': 'PC88',
  'Atari Lynx': 'Lynx',
  WonderSwan: 'WS',
  'Game Boy': 'GB',
  'Game Boy Color': 'GBC',
  'Game Boy Advance': 'GBA',
  'Nintendo DS': 'DS',
  'Pokemon Mini': 'PM',
  'Game Gear': 'GG',
  'Neo Geo Pocket': 'NGP',
  Intellivision: 'INTV',
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

    const endpoint = `https://retroachievements.org/API/API_GetGameExtended.php?z=${RA_USER}&y=${RA_WEB_API_KEY}`;

    const templateMsg = ['```html\n'];

    const canvas = Canvas.createCanvas(468, 220);
    const ctx = canvas.getContext('2d');
    const grid = { width: 156, height: 110 };

    try {
      for (let i = 0; i < gameIds.length && i < 6; i += 1) {
        const id = Number.parseInt(gameIds[i], 10);
        if (id <= 0) {
          return sentMsg.edit(`**ERROR**: invalid game ID: \`${gameIds[i]}\``);
        }

        const res = await fetch(`${endpoint}&i=${id}`);
        const json = await res.json();

        const gameUri = `/game/${json.ID}`;
        const gameTitle = `${json.Title} (${abbreviations[json.ConsoleName] || json.ConsoleName})`;

        const authorSet = new Set();
        const dates = new Set();

        const achievements = Object.keys(json.Achievements);
        achievements.forEach((cheevo) => {
          authorSet.add(json.Achievements[cheevo].Author);
          dates.add(json.Achievements[cheevo].DateCreated.replace(/ ..:..:..$/, ''));
        });

        const authorsMsg = [];
        [...authorSet].map((author) => authorsMsg.push(`<a href="/user/${author}">${author}</a>`));

        const releaseDate = [...dates].reduce((d1, d2) => {
          const date1 = new Date(d1);
          const date2 = new Date(d2);
          return date1 >= date2 ? d1 : d2;
        });

        templateMsg.push(`${releaseDate} <a href="${gameUri}">${gameTitle}</a> by ${authorsMsg.join(' and ')}<br />\n\n`);

        // creating the HotCheevs background
        const titleScreenUrl = `https://retroachievements.org${json.ImageTitle}`;
        const titleScreen = await Canvas.loadImage(titleScreenUrl);

        // titleScreen position in the hotcheevs background grid image
        const imgX = (i % 3) * grid.width;
        const imgY = Math.trunc(i / 3) * grid.height;

        // Nintendo DS title screens needs an extra care
        if (json.ConsoleName === 'Nintendo DS') {
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
