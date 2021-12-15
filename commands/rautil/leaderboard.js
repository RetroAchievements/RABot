/**
 * Runs when a `lb` or `leaderboard` command is executed. Sends an embed containing
 * the top 10 leaderboards entries for the leaderboard ID passed in with the command.
 */

const { RichEmbed } = require('discord.js');
const fetch = require('node-fetch');

const Command = require('../../structures/Command.js');

const raUrl = 'https://retroachievements.org/';

module.exports = class LeaderboardCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leaderboard',
      aliases: ['leaderboard', 'lb'],
      group: 'rautil',
      memberName: 'leaderboard',
      description: 'Return leaderboard top 10.',
      examples: [
        '`lb 2` Shows the top 10 users for leaderboard ID 2.',
      ],
      throttling: {
        usages: 5,
        duration: 60,
      },
      args: [
        {
          key: 'id',
          prompt: 'Leaderboard ID to get top 10 for.',
          type: 'string',
          default: ''
        }
      ],
    });
  }

  /**
   * Converts score to the correct displayable format.
   * 
   * @param   {String}  type  Leaderboard score type
   * @param   {Number}  score Score value to convert
   * @returns {String}        Score formatted to a human readable output string
   */
  convertScore(type, score) {
    switch (type) {
      case 'TIME': // Number of frames
        var hours = Math.trunc(score / 216000);
        var minutes = Math.trunc((score / 3600) - (hours * 60));
        var seconds = Math.trunc((score % 3600) / 60);
        var milliseconds = Math.trunc(((score % 3600) % 60) * (100.0 / 60.0));

        return `**Time:** ` + this.formatValues(hours, minutes, seconds) + "." +
          String(milliseconds).padStart(2, '0');
      case 'TIMESEC': // Number of seconds
        var hours = Math.trunc(score / 360);
        var minutes = Math.trunc((score / 60) - (hours * 60));
        var seconds = Math.trunc(score % 60);

        return `**Time:** ` + this.formatValues(hours, minutes, seconds);
      case 'MILLISECS': // Number of milliseconds
        var hours = Math.trunc(score / 360000);
        var minutes = Math.trunc((score / 6000) - (hours * 60));
        var seconds = Math.trunc((score % 6000) / 100);
        var milliseconds = Math.trunc((score % 100));

        return `**Time:** ` + this.formatValues(hours, minutes, seconds) + "." +
          String(milliseconds).padStart(2, '0');
      default:
        return `**Score:** ` + score;
    }
  }

  /**
   * Formats leaderboard time depending on the number of hours.
   * 
   * @param   {Number}  hours   Hours value
   * @param   {Number}  minutes Minutes value
   * @param   {Number}  seconds Seconds value
   * @returns {String}          Hour/Minute/Second score formatted to a human readable output string
   */
  formatValues(hours, minutes, seconds) {
    if (hours == 0) {
      return String(minutes).padStart(2, '0') + ":" +
        String(seconds).padStart(2, '0');
    }

    return String(hours).padStart(2, '0') + "h" +
      String(minutes).padStart(2, '0') + ":" +
      String(seconds).padStart(2, '0');
  }

  /**
   * Converts a unix time to a human readable date/time format.
   * For example: `20 Mar 2021, 12:00 PM)`.
   * 
   * @param   {Number}  timestamp Unix time
   * @returns {String}            Unix time formatted to a human readable output string
   */
  getDate(timestamp) {
    let date = new Date(timestamp);

    let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    let month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    let time = new Intl.DateTimeFormat('en-GB', { timeStyle: 'short', timeZone: 'UTC' }).format(date);
    return `${day} ${month} ${year}, ${time}`;
  }

  /**
   * Fetch the JSON from the dorequest call.
   * 
   * @param   {String}  dorequestLeaderboardUrl Leaderboard dorequest URL
   * @returns {String}                          JSON output from dorequest call
   */
  async getDoRequestJson(dorequestLeaderboardUrl) {
    return fetch(dorequestLeaderboardUrl)
      .then((res) => res.json())
      .then((res) => res.LeaderboardData)
      .catch(() => null);
  }

  /**
   * Generate the embed for the leaderboard data.
   * 
   * @param   {Number}    leaderboardID Leaderboard ID to fetch data for
   * @returns {RichEmbed}               Embed filled with leaderboard data
   */
  async getLbEmbed(leaderboardID) {
    // Check the input leaderboard ID
    const id = Number.parseInt(leaderboardID, 10);
    if (Number.isNaN(id) || id <= 0) {
      return '**ERROR**: Missing or invalid leaderboard ID.';
    }

    const dorequestLeaderboardUrl = `${raUrl}dorequest.php?r=lbinfo&i=${leaderboardID}`;
    const json = await this.getDoRequestJson(dorequestLeaderboardUrl);

    // Check if leaderboard exists
    if (json.LBID == 0) {
      return '**ERROR**: Leaderboard ID does not exist.';
    }

    // Create embed header
    const embed = new RichEmbed()
      .setColor('#00ff00')
      .setTitle(`${json.LBTitle} (${json.GameTitle})`)
      .setDescription(`${json.LBDesc}`)
      .setURL(raUrl + 'leaderboardinfo.php?i=' + leaderboardID)
      .setThumbnail('https://s3-eu-west-1.amazonaws.com/i.retroachievements.org' + json.GameIcon)
      .setFooter(`Created ` + (json.LBAuthor == null ? `` : `by ${json.LBAuthor} `) + `on ${json.LBCreated}.`);

    // Loop through leaderboard entries and fill the embed
    const lbEntries = json.Entries;
    for (let i = 0; i < lbEntries.length; i += 1) {
      embed
        .addField(
          lbEntries[i].Rank + `: ` + lbEntries[i].User,
          this.convertScore(json.LBFormat, lbEntries[i].Score) + `\n` +
          `**Date:** ` + this.getDate(lbEntries[i].DateSubmitted * 1000)
        );
    }

    return embed;
  }

  /**
   * Runs the leaderboard command.
   * 
   * @param   {Object}  msg Message to respond to
   * @param   {Number}  id  Leaderboard ID to fetch data for
   * @returns {Promise}     Promise completion
   */
  async run(msg, { id }) {
    const sentMsg = await msg.reply(':hourglass: Getting info, please wait...');
    let response = `${id}`;
    response = await this.getLbEmbed(id);

    return sentMsg.edit(response);
  }
};
