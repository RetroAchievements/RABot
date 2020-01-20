const { RichEmbed } = require('discord.js');
const fetch = require('node-fetch');
const Command = require('../../structures/Command.js');

module.exports = class User extends Command {
  constructor(client) {
    super(client, {
      name: 'user',
      group: 'rautil',
      memberName: 'user',
      description: 'Show the current user stats.',
      examples: ['`!user username`'],
      throttling: {
        usages: 2,
        duration: 60,
      },
      argsPromptLimit: 0,
      args: [
        {
          key: 'username',
          type: 'string',
          prompt: 'What user would you like to fetch?',
          default: '',
          parse: (username) => username.toLowerCase(),
        },
      ],
    });
  }

  async run(msg, { username }) {
    const u = process.env.RA_USER;
    const k = process.env.RA_WEB_API_KEY;
    const baseUrl = 'https://retroachievements.org/';
    let userName = username;

    if (userName === '') {
      userName = msg.member ? (msg.member.nickname || msg.author.username) : msg.author.username;
    }

    const url = `${baseUrl}API/API_GetUserSummary.php?z=${u}&y=${k}&u=${userName}`;
    const sentMsg = await msg.reply(`:hourglass: Getting ${userName}'s info, please wait...`);

    // permissions magic numbers
    // https://github.com/RetroAchievements/RAWeb/blob/develop/src/Permissions.php
    const permissions = {
      '-2': 'Spam',
      '-1': 'Banned',
      0: 'Unregistered',
      1: 'Registered',
      2: 'SuperUser',
      3: 'Developer',
      4: 'Admin',
      5: 'Root',
    };

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        if (res.ID == null) {
          return sentMsg.edit(`Couldn't find any user called **${userName}** on site.`);
        }

        const richEmbed = new RichEmbed()
          .setColor('#3498DB')
          .setTitle(`Role: ${permissions[res.Permissions]}`)
          .setURL(`${baseUrl}user/${userName}`)
          .setAuthor(userName, baseUrl + res.UserPic);

        if (res.Motto) {
          richEmbed.addField(':speech_balloon: Motto', `**${res.Motto}**`);
        }

        richEmbed
          .addField(
            ':bust_in_silhouette: Member since',
            `**${res.MemberSince}**`,
          )
          .addField(
            ':trophy: Rank | Points',
            `Rank **${res.Rank}** | **${res.Points}** points`,
          )
          .addField(
            `:video_game: Last game played (${res.RecentlyPlayed[0] ? res.RecentlyPlayed[0].LastPlayed : ''})`,
            `**${res.RecentlyPlayed[0] ? res.RecentlyPlayed[0].Title : ''} (${res.RecentlyPlayed[0] ? res.RecentlyPlayed[0].ConsoleName : ''})**`,
          );

        if (res.RichPresenceMsg && res.LastGame) {
          richEmbed.addField(
            ':clock4: Last seen in',
            `**${res.LastGame.Title} (${res.LastGame.ConsoleName})**:\n${res.RichPresenceMsg}`,
          );
        }

        return sentMsg.edit(richEmbed);
      })
      .catch(() => sentMsg.edit('Ouch! An error occurred! :frowning2:\nPlease, contact a @mod.'));
  }
};
