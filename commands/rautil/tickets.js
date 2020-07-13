const { RichEmbed } = require('discord.js');
const fetch = require('node-fetch');

const Command = require('../../structures/Command.js');
const { isValidUsername } = require('../../util/Utils');

const { RA_USER, RA_WEB_API_KEY } = process.env;

const defaultArg = '~NOARGS~';
const raUrl = 'https://retroachievements.org';
const apiUrl = `${raUrl}/API/API_GetTicketData.php?z=${RA_USER}&y=${RA_WEB_API_KEY}`;

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

    const json = await this.getApiJson(`${apiUrl}&i=${id}`);
    if (!json) {
      return `**ERROR**: failed to get info for ticket ${id}`;
    }

    const truncate = (str, n = 512) => ((str.length > n) ? `${str.substr(0, n - 1)}...` : str);

    const embed = new RichEmbed()
      .setColor('#ff0000')
      .setTitle(`Ticket ID ${id}`)
      .setURL(json.URL)
      .addField('**Status**', json.ReportStateDescription, true)
      .addField('**Resolved by**', json.ResolvedBy || '-', true)
      .addField('**Ach. Author**', json.AchievementAuthor)
      .addField('**Ach. Title**', json.AchievementTitle, true)
      .addField('**Ach. Description**', json.AchievementDesc, true)
      .addField('**Game**', `${json.GameTitle} (${json.ConsoleName})`)
      .addField('**Reported by**', json.ReportedBy, true)
      .addField('**Report Type**', json.ReportTypeDescription || '-', true)
      .addField('**Notes**', truncate(json.ReportNotes.replace(/<br>/i, '\n')));

    return embed;
  }

  async getGameTicketEmbed(givenId) {
    const id = Number.parseInt(givenId, 10);
    if (Number.isNaN(id) || id <= 0) {
      return '**ERROR**: missing/invalid game ID';
    }

    const json = await this.getApiJson(`${apiUrl}&g=${id}`);
    if (!json || json.error) {
      return `**ERROR**: failed to get ticket info for game ID ${id}`;
    }

    const embed = new RichEmbed()
      .setColor('#ff0000')
      .setTitle(`${json.GameTitle} (${json.ConsoleName})`)
      .setURL(json.URL)
      .addField('**Open Tickets**', json.OpenTickets);

    return embed;
  }

  async getAchievementTicketEmbed(givenId) {
    const id = Number.parseInt(givenId, 10);
    if (Number.isNaN(id) || id <= 0) {
      return '**ERROR**: missing/invalid achievement ID';
    }

    const json = await this.getApiJson(`${apiUrl}&a=${id}`);
    if (!json) {
      return `**ERROR**: failed to get ticket info for achievement ID ${id}`;
    }

    const embed = new RichEmbed()
      .setColor('#ff0000')
      .setTitle(`${json.GameTitle} (${json.ConsoleName})`)
      .setURL(json.URL)
      .addField('**Open Tickets**', json.OpenTickets);

    return embed;
  }

  async getUserTicketEmbed(user) {
    if (!isValidUsername(user)) {
      return `**ERROR**: invalid username: ${user}`;
    }

    const json = await this.getApiJson(`${apiUrl}&u=${user}`);
    if (!json) {
      return `**ERROR**: failed to get ticket info for user R${user}`;
    }

    const embed = new RichEmbed()
      .setColor('#ff0000')
      .setTitle(`Ticket info for user "${json.User}"`)
      .setURL(json.URL)
      .addField('**Open**', json.Open, true)
      .addField('**Resolved**', json.Resolved, true)
      .addField('**Closed**', json.Closed, true)
      .addField('**Total**', json.Total, true);

    return embed;
  }

  async getTicketRanking() {
    const json = await this.getApiJson(`${apiUrl}&f=1`);
    if (!json) {
      return '**ERROR**: failed to get ticket ranking';
    }

    const embed = new RichEmbed()
      .setColor('#ff0000')
      .setTitle('Most Reported Games')
      .setURL(json.URL);

    const games = json.MostReportedGames;
    for (let i = 0; i < games.length; i += 1) {
      embed.addField(
        `**${games[i].GameTitle} (${games[i].Console})**`,
        `**[${games[i].OpenTickets}](${raUrl}/ticketmanager.php?g=${games[i].GameID})**`,
      );
    }

    return embed;
  }

  async getRecentTickets() {
    const json = await this.getApiJson(`${apiUrl}`);
    if (!json) {
      return '**ERROR**: failed to get tickets info';
    }

    const reportTypes = ['', 'Triggered at a wrong time', "Doesn't trigger"];

    const embed = new RichEmbed()
      .setColor('#ff0000')
      .setTitle(`Recent Tickets (Total Open: ${json.OpenTickets})`)
      .setURL(json.URL);

    const tickets = json.RecentTickets;
    for (let i = 0; i < tickets.length; i += 1) {
      embed
        .addField(
          tickets[i].AchievementTitle,
          `**Ticket**: [${tickets[i].ID}](${raUrl}/ticketmanager.php?i=${tickets[i].ID})`
          + ` | **Type**: ${reportTypes[tickets[i].ReportType]}`
          + ` | **Reported by**: ${tickets[i].ReportedBy}`
          + ` | **Ach. Author**: ${tickets[i].AchievementAuthor}`,
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
