const { MessageEmbed } = require('discord.js');
const { buildAuthorization, getUserSummary } = require('@retroachievements/api');
const Command = require('../../structures/Command');

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

    const sentMsg = await msg.reply(`:hourglass: Getting ${userName}'s info, please wait...`);

    // permissions magic numbers
    // https://github.com/RetroAchievements/RAWeb/blob/develop/src/Permissions.php
    const permissions = {
      '-2': 'Spam',
      '-1': 'Banned',
      0: 'Unregistered',
      1: 'Registered',
      2: 'JuniorDeveloper',
      3: 'Developer',
      4: 'Admin',
      5: 'Root',
    };

    try {
      const authorization = buildAuthorization({
        userName: u,
        webApiKey: k,
      });

      const userSummary = await getUserSummary(authorization, { userName });

      if (userSummary.id === null) {
        return sentMsg.edit(`Couldn't find any user called **${userName}** on site.`);
      }

      const embed = new MessageEmbed()
        .setColor('#3498DB')
        .setTitle(`Role: ${permissions[userSummary.permissions]}`)
        .setURL(`${baseUrl}user/${userName}`)
        .setAuthor(userName, baseUrl + userSummary.userPic);

      if (userSummary.motto) {
        embed.addField(':speech_balloon: Motto', `**${userSummary.motto}**`);
      }

      embed
        .addField(
          ':bust_in_silhouette: Member since',
          `**${userSummary.memberSince}**`,
        )
        .addField(
          ':trophy: Rank | Points',
          `Rank **${userSummary.rank}** | **${userSummary.points}** points`,
        )
        .addField(
          `:video_game: Last game played (${userSummary.recentlyPlayed[0] ? userSummary.recentlyPlayed[0].lastPlayed : ''})`,
          `**${userSummary.recentlyPlayed[0] ? userSummary.recentlyPlayed[0].title : ''} (${userSummary.recentlyPlayed[0] ? userSummary.recentlyPlayed[0].consoleName : ''})**`,
        );

      if (userSummary.richPresenceMsg && userSummary.lastGame) {
        embed.addField(
          ':clock4: Last seen in',
          `**${userSummary.lastGame.title} (${userSummary.lastGame.consoleName})**:\n${userSummary.richPresenceMsg}`,
        );
      }

      return sentMsg.edit(embed);
    } catch (error) {
      sentMsg.edit('Ouch! An error occurred! :frowning2:\nPlease, contact a @mod.');
    }
  }
};
