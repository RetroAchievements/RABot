const { buildAuthorization, getAchievementOfTheWeek } = require('@retroachievements/api');
const Command = require('../../structures/Command');

const { RA_USER, RA_WEB_API_KEY } = process.env;

module.exports = class AotwCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'aotw',
      group: 'rautil',
      memberName: 'aotw',
      description: 'Show the current Achievement of the Week and the recent winners.',
      examples: ['`aotw`'],
      throttling: {
        usages: 2,
        duration: 120,
      },
    });
  }

  async run(msg) {
    const max = 20;
    const sentMsg = await msg.reply(':hourglass: Getting AotW info, please wait...');

    try {
      const authorization = buildAuthorization({
        userName: RA_USER,
        webApiKey: RA_WEB_API_KEY,
      });
      const { achievement, unlocks: winners } = await getAchievementOfTheWeek(authorization);

      const aotwUrl = `https://retroachievements.org/achievement/${achievement.id}`;

      let response = `:trophy: __**Achievement of the Week**__ :trophy:\n${aotwUrl}`;
      response += `\n\n**Recent Winners** (max ${max}, UTC time):\n`;
      response += '```md\n';

      winners.reverse();

      for (let i = 0; i < max && i < winners.length; i += 1) {
        response += `\n[${winners[i].dateAwarded}]`;
        response += `( ${winners[i].user} ) `;
        response += winners[i].hardcoreMode ? '<hardcore> +1' : '+0.5';
      }
      response += '\n```\n';

      return sentMsg.edit(response);
    } catch (error) {
      sentMsg.delete();
    }
  }
};
