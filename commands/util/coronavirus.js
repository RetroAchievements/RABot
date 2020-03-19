const fetch = require('node-fetch');
const Command = require('../../structures/Command');

module.exports = class CoronaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'coronavirus',
      aliases: ['corona', 'covid'],
      group: 'util',
      memberName: 'coronavirus',
      description: 'Show the current number of cases of COVID-19 globally and by country.',
      examples: ['`corona`', '`corona china`'],
      throttling: {
        usages: 5,
        duration: 60,
      },
      argsPromptLimit: 0,
      args: [
        {
          key: 'inCountry',
          type: 'string',
          prompt: 'Which country?',
          default: '',
          parse: (country) => country.toLowerCase(),
        },
      ],
    });
  }

  async run(msg, { inCountry }) {
    const sentMsg = await msg.reply(':hourglass: Getting data, please wait...');
    const apiUrl = 'https://coronavirus-19-api.herokuapp.com';
    let endpoint = '';

    endpoint = !inCountry ? 'all' : `countries/${inCountry}`;

    fetch(`${apiUrl}/${endpoint}`)
      .then((res) => res.text())
      .then((res) => {
        if (!inCountry) {
          const { cases, deaths, recovered } = JSON.parse(res);
          const response = '__**REPORTED CASES OF COVID-19**\n__'
            + `\n**Cases:** ${cases.toLocaleString()}`
            + `\n**Deaths:** ${deaths.toLocaleString()}`
            + `\n**Recovered:** ${recovered.toLocaleString()}`
            + '\n\nsource: <https://www.worldometers.info/coronavirus/>';
          sentMsg.edit(response);
        } else {
          const {
            country, cases, todayCases, deaths, todayDeaths, recovered, critical,
          } = JSON.parse(res);
          const response = `__**REPORTED CASES OF COVID-19 IN ${country.toUpperCase()}**__\n`
            + `\n**Cases:** ${cases.toLocaleString()}`
            + `\n**Cases today:** ${todayCases.toLocaleString()}`
            + `\n**Deaths:** ${deaths.toLocaleString()}`
            + `\n**Deaths today:** ${todayDeaths.toLocaleString()}`
            + `\n**Critical patients:** ${critical.toLocaleString()}`
            + `\n**Recovered:** ${recovered.toLocaleString()}`
            + '\n\nsource: <https://www.worldometers.info/coronavirus/>';
          sentMsg.edit(response);
        }
      })
      .catch(() => sentMsg.edit("Ouch! I wasn't able to get the info... :frowning:"));
  }
};
