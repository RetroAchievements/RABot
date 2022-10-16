const moment = require('moment-timezone');
const cityTimezones = require('city-timezones');
const Command = require('../../structures/Command');
const { firstUpperCase } = require('../../util/Utils');

module.exports = class TimeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'timenow',
      aliases: ['timezone', 'tz'],
      group: 'util',
      memberName: 'timenow',
      description: 'Responds with the current time in a particular location. This can be done searching via timezone or city.',
      examples: ['`!timenow New York`', '`!timenow America/New_York`'],
      credit: [
        {
          name: 'List of tz database time zones',
          url: 'https://en.wikipedia.org/wiki/List_of_tz_database_time_zones',
        },
      ],
      args: [
        {
          key: 'lookup',
          label: 'time date',
          prompt: 'Which time zone do you want to get the time of?',
          type: 'string',
          parse: (lookup) => lookup.toLowerCase(),
        },
      ],
    });
  }

  run(msg, { lookup }) {
    let location = [];
    let country = '';
    let city = '';

    const cityLookUp = cityTimezones.lookupViaCity(lookup);

    if (typeof cityLookUp[0] !== 'object' && !moment.tz.zone(lookup)) {
      return msg.reply('Invalid time zone. For help please refer to <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>.');
    }
    const timeNow = !moment.tz.zone(lookup) ? moment().tz(cityLookUp[0].timezone).format('h:mm A z') : moment().tz(lookup).format('h:mm A z');

    if (moment.tz.zone(lookup)) {
      location = lookup.split('/');
      country = firstUpperCase(location[0]);
      if (location[1]) {
        city = firstUpperCase(location[1]);
        city = city.split('_').join(' ');
      }
    } else {
      country = cityLookUp[0].city;
      city = cityLookUp[0].country;
    }

    return msg.say(`The current time in ${country}, ${city} is ${timeNow}.`);
  }
};
