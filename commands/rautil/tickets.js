const { MessageEmbed } = require('discord.js');
const { buildAuthorization, getTicketData } = require('@retroachievements/api');
const fetch = require('node-fetch');

const Command = require('../../structures/Command');
const { isValidUsername } = require('../../util/Utils');

const { RA_USER, RA_WEB_API_KEY } = process.env;
const authorization = buildAuthorization({
  userName: RA_USER,
  webApiKey: RA_WEB_API_KEY,
});

const defaultArg = '~NOARGS~';
const raUrl = 'https://retroachievements.org';

module.exports = class TicketsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tickets',
      aliases: ['ticket', 'tkt'],
      group: 'rautil',
      memberName: 'tickets',
      description: 'Return ticket info.',
      examples: [
        '`tkt` last 10 tickets (and total amount of open tickets)',
        '`tkt id 28327` show details of ticket 28327',
        '`tkt game 1277` total amount of open tickets for game 1277',
        '`tkt ach 49229` total amount of open tickets for achievement 49229',
        '`tkt user televandalist` ticket stats for user televandalist',
        '`tkt rank` ranking of most reported games',
      ],
      throttling: {
        usages: 5,
        duration: 60,
      },
      args: [
        {
          key: 'info',
          prompt: 'Wich kind of ticket info do you want to get? Valid options: `id`, `game`, `ach`, `user`, `rank`.',
          type: 'string',
          default: defaultArg,
          validate: (info) => /^(|id|game|ach|user|rank)$/i.test(info),
        },
        {
          key: 'id',
          prompt: '',
          type: 'string',
          default: defaultArg,
        },
      ],
    });
  }

  getApiJson(endpointUrl) {
    return fetch(endpointUrl)
      .then((res) => res.json())
      .catch(() => null);
  }

  async getTicketIdEmbed(givenId) {
    const id = Number.parseInt(givenId, 10);
    if (Number.isNaN(id) || id <= 0) {
      return '**ERROR**: missing/invalid ticket ID';
    }

    const json = await getTicketData(authorization, { ticketId: id });
    if (!json) {
      return `**ERROR**: failed to get info for ticket ${id}`;
    }

    const truncate = (str, n = 512) => ((str.length > n) ? `${str.substr(0, n - 1)}...` : str);

    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle(`Ticket ID ${id}`)
      .setURL(json.url)
      .addField('**Status**', json.reportStateDescription, true)
      .addField('**Resolved by**', json.reportedBy || '-', true)
      .addField('**Ach. Author**', json.achievementAuthor)
      .addField('**Ach. Title**', json.achievementTitle, true)
      .addField('**Ach. Description**', json.achievementDesc, true)
      .addField('**Game**', `${json.gameTitle} (${json.consoleName})`)
      .addField('**Reported by**', json.reportedBy, true)
      .addField('**Report Type**', json.reportTypeDescription || '-', true)
      .addField('**Notes**', truncate(json.reportNotes.replace(/<br>/i, '\n')));

    return embed;
  }

  async getGameTicketEmbed(givenId) {
    const id = Number.parseInt(givenId, 10);
    if (Number.isNaN(id) || id <= 0) {
      return '**ERROR**: missing/invalid game ID';
    }

    const json = await getTicketData(authorization, { gameId: id });
    if (!json || json.error) {
      return `**ERROR**: failed to get ticket info for game ID ${id}`;
    }

    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle(`${json.gameTitle} (${json.consoleName})`)
      .setURL(json.url)
      .addField('**Open Tickets**', json.openTickets);

    return embed;
  }

  async getAchievementTicketEmbed(givenId) {
    const id = Number.parseInt(givenId, 10);
    if (Number.isNaN(id) || id <= 0) {
      return '**ERROR**: missing/invalid achievement ID';
    }

    const json = await getTicketData(authorization, { achievementId: id });
    if (!json) {
      return `**ERROR**: failed to get ticket info for achievement ID ${id}`;
    }

    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle(`${json.gameTitle} (${json.consoleName})`)
      .setURL(json.url)
      .addField('**Open Tickets**', json.openTickets);

    return embed;
  }

  async getUserTicketEmbed(user) {
    if (!isValidUsername(user)) {
      return `**ERROR**: invalid username: ${user}`;
    }

    const json = await getTicketData(authorization, { userName: user });
    if (!json) {
      return `**ERROR**: failed to get ticket info for user R${user}`;
    }

    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle(`Ticket info for user "${json.user}"`)
      .setURL(json.url)
      .addField('**Open**', json.open, true)
      .addField('**Resolved**', json.resolved, true)
      .addField('**Closed**', json.closed, true)
      .addField('**Total**', json.total, true);

    return embed;
  }

  async getTicketRanking() {
    const json = await getTicketData(authorization, {
      isGettingMostTicketedGames: true,
    });
    if (!json) {
      return '**ERROR**: failed to get ticket ranking';
    }

    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle('Most Reported Games')
      .setURL(json.url);

    for (const game of json.mostReportedGames) {
      embed.addField(
        `**${game.gameTitle} (${game.console})**`,
        `**[${game.openTickets}](${raUrl}/ticketmanager.php?g=${game.gameId})**`,
      );
    }

    return embed;
  }

  async getRecentTickets() {
    const json = await getTicketData(authorization);
    if (!json) {
      return '**ERROR**: failed to get tickets info';
    }

    const reportTypes = ['', 'Triggered at a wrong time', "Doesn't trigger"];

    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle(`Recent Tickets (Total Open: ${json.openTickets})`)
      .setURL(json.url);

    for (const ticket of json.recentTickets) {
      embed
        .addField(
          ticket.achievementTitle,
          `**Ticket**: [${ticket.id}](${raUrl}/ticketmanager.php?i=${ticket.id})`
          + ` | **Type**: ${reportTypes[ticket.reportType]}`
          + ` | **Reported by**: ${ticket.reportedBy}`
          + ` | **Ach. Author**: ${ticket.achievementAuthor}`,
        );
    }

    return embed;
  }

  async run(msg, { info, id }) {
    const sentMsg = await msg.reply(':hourglass: Getting info, please wait...');
    let response = `${info} ${id}`;

    switch (info) {
      case 'id':
        response = await this.getTicketIdEmbed(id);
        break;
      case 'game':
        response = await this.getGameTicketEmbed(id);
        break;
      case 'ach':
        response = await this.getAchievementTicketEmbed(id);
        break;
      case 'user':
        response = await this.getUserTicketEmbed(id);
        break;
      case 'rank':
        response = await this.getTicketRanking();
        break;
      default:
        response = await this.getRecentTickets();
    }

    return sentMsg.edit(response);
  }
};
