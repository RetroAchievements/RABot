const Command = require('../../structures/Command');
const moment = require('moment-timezone');
const {firstUpperCase} = require('../../util/Utils.js');
const cityTimezones = require('city-timezones');

module.exports = class TimeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'timenow',
			aliases: ['time-zone'],
			group: 'util',
			memberName: 'timenow',
			description: 'Responds with the current time in a particular location.',
            details: '**Zones:** <https://en.wikinpmpedia.org/wiki/List_of_tz_database_time_zones>',
            examples: ['`!timenow America/New_York`'],
			credit: [
				{
					name: 'List of tz database time zones',
					url: 'https://en.wikipedia.org/wiki/List_of_tz_database_time_zones'
				},
			],
			args: [
				{
					key: 'timeDate',
					label: 'time date',
					prompt: 'Which time zone do you want to get the time of?',
					type: 'string',
					parse: timeDate => timeDate.replace(/ /g, '_').toLowerCase()
				}
			]
		});
	}

	run(msg, {timeDate }) {
        
		if (!moment.tz.zone(timeDate)) {
			return msg.reply('Invalid time zone. Refer to <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>.');
        }
        
        const time_now = moment().tz(timeDate).format('h:mm A');
        const time_zone = moment().tz(timeDate).zoneAbbr();
        const location = timeDate.split('/');

		const place = firstUpperCase(location[0]);
		const city = location[1] ? firstUpperCase(location[1]) : null;
		return msg.say(`The current time in ${place}, ${city} is ${time_now} ${time_zone}.`);
	}
};