/* eslint-disable no-await-in-loop */
const fetch = require('node-fetch');
const Canvas = require('canvas');
// const { MessageAttachment } = require('discord.js'); // <-- this works on djs v12
const { Attachment } = require('discord.js');

const Command = require('../../structures/Command.js');

const { RA_USER, RA_WEB_API_KEY } = process.env;

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
          type: 'integer',
          prompt: '',
          infinite: true,
          default: '~NO~OPTS~',
          validate: (gameId) => gameId > 0,
        },
      ],
    });
  }

  async run(msg, { gameIds }) {
    if (gameIds.length < 6) {
      return msg.reply(':octagonal_sign: **Whooops!**\nPlease, give me exactly six game IDs!');
    }

    const sentMsg = await msg.say(':hourglass: Getting info, please wait...');
    const endpoint = `https://retroachievements.org/API/API_GetGameExtended.php?z=${RA_USER}&y=${RA_WEB_API_KEY}`;

    const templateMsg = ['```html\n'];

    const canvas = Canvas.createCanvas(468, 220);
    const ctx = canvas.getContext('2d');

    try {
      for (let i = 0; i < gameIds.length && i < 6; i += 1) {
        const res = await fetch(`${endpoint}&i=${gameIds[i]}`);
        const json = await res.json();

        const gameUri = `/game/${json.ID}`;
        const gameTitle = `${json.Title} (${json.ConsoleName})`;

        const authorSet = new Set();

        const achievements = Object.keys(json.Achievements);
        achievements.map((cheevo) => authorSet.add(json.Achievements[cheevo].Author));

        const authorsMsg = [];

        [...authorSet].map((author) => authorsMsg.push(`<a href="/user/${author}">${author}</a>`));

        templateMsg.push(`??.??.?? <a href="${gameUri}">${gameTitle}</a> by ${authorsMsg.join(' and ')}<br />\n\n`);

        // creating the HotCheevs background
        const titleScreenUrl = `https://retroachievements.org${json.ImageTitle}`;
        const titleScreen = await Canvas.loadImage(titleScreenUrl);

        ctx.drawImage(titleScreen, (i % 3) * 156, (i % 2) * 110, 156, 110);
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
