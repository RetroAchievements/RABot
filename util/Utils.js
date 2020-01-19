const fetch = require('node-fetch');
const cheerio = require('cheerio');

const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea', 'ya'];
const no = ['no', 'n', 'nah', 'nope', 'nop'];

module.exports = class Utils {
  static isValidUsername(user) {
    return /^[a-z0-9]{2,20}$/i.test(user);
  }

  static async bestDays(user, days) {
    if (!Utils.isValidUsername(user)) return false;

    const url = `https://retroachievements.org/history.php?u=${user}`;
    const date = [];
    const cheevos = [];
    const score = [];

    const res = await fetch(`${url}&c=${days}`);
    const $ = cheerio.load(await res.text());

    const bestDays = $('table.smalltable').find('tr').map((i, element) => ({
      date: $(element).find('td:nth-of-type(1)').text().trim(),
      achievements: $(element).find('td:nth-of-type(2)').text().trim(),
      score: $(element).find('td:nth-of-type(3)').text().trim(),
    })).get();

    if (bestDays.length <= 2) {
      return false;
    }

    for (let i = 1; i <= days && i < bestDays.length; i += 1) {
      date.push(bestDays[i].date);
      cheevos.push(bestDays[i].achievements);
      score.push(bestDays[i].score);
    }

    return {
      date,
      cheevos,
      score,
    };
  }

  static async bestScoreComment(user) {
    const bestDay = await Utils.bestDays(user, 1);
    if (!bestDay) return false;

    const bestScore = bestDay.score[0];
    let scoreComment = false;

    if (bestScore >= 3500) {
      scoreComment = `**Best score in a day**: ${bestScore}\n`;
      if (bestScore >= 10000) scoreComment += '**GASP! This user has a ridiculously unreal score for a single day!!!**';
      else if (bestScore >= 6000) scoreComment += '**WOW!** This user seems to play retrogames all day long!';
      else if (bestScore >= 5000) scoreComment += "That's a pretty dedicated retrogamer";
      else { // the ">= 3500" case
        scoreComment += "That's a good retrogamer!";
      }
    }
    return scoreComment;
  }


  static async googleGameId(terms) {
    const regex = /retroachievements\.org\/game\/([0-9]+)/i;
    const site = 'retroachievements.org/game';
    let searchURL = `https://www.google.com/search?q=site:${site}`;
    let parseGameUrl = 0;
    let gameid = 0;

    terms.forEach((term) => {
      searchURL += `+${term}`;
    });

    const res = await fetch(encodeURI(searchURL));
    const $ = cheerio.load(await res.text());

    parseGameUrl = $('h3.r').toString().match(regex);
    gameid = parseGameUrl ? parseGameUrl[1] : 0;

    return gameid;
  }


  static shorten(text, maxLength = 2000) {
    return text.length > maxLength ? `${text.substr(0, maxLength - 3)}...` : text;
  }


  static randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static async verify(channel, user, time = 30000) {
    const filter = (res) => {
      const value = res.content.toLowerCase();
      return res.author.id === user.id && (yes.includes(value) || no.includes(value));
    };

    const verify = await channel.awaitMessages(filter, {
      max: 1,
      time,
    });

    if (!verify.size) return 0;

    const choice = verify.first().content.toLowerCase();

    if (yes.includes(choice)) return true;

    if (no.includes(choice)) return false;

    return false;
  }

  static firstUpperCase(text) {
    return text.split().map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
  }
};
