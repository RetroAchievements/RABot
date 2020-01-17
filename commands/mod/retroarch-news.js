const SelfRoleCommand = require('../../structures/SelfRoleCommand.js');

require('dotenv').config({ path: `${__dirname}/.env` });

const { RETROARCH_NEWS } = process.env;


module.exports = class RetroarchNewsCommand extends SelfRoleCommand {
  constructor(client) {
    super(client, {
      name: 'retroarch-news',
      group: 'mod',
      aliases: ['retroarchnews', 'rarchnews', 'rarch-news'],
      memberName: 'retroarch-news',
      description: 'Add/Remove the `@retroarch-news` role to/from yourself',
      argsPromptLimit: 0,
      args: [
        {
          key: 'action',
          type: 'string',
          prompt: '',
          default: 'show',
        },
      ],
    }, RETROARCH_NEWS);
  }
};
