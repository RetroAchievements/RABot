const SelfRoleCommand = require('../../structures/SelfRoleCommand.js');

require('dotenv').config({ path: `${__dirname}/.env` });

const { EVENT_NEWS } = process.env;


module.exports = class EventNewsCommand extends SelfRoleCommand {
  constructor(client) {
    super(client, {
      name: 'event-news',
      group: 'mod',
      aliases: ['eventnews'],
      memberName: 'event-news',
      description: 'Add/Remove the `@event-news` role to/from yourself',
      argsPromptLimit: 0,
      args: [
        {
          key: 'action',
          type: 'string',
          prompt: '',
          default: 'show',
        },
      ],
    }, EVENT_NEWS);
  }
};
