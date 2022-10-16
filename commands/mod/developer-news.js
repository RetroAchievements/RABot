const SelfRoleCommand = require('../../structures/SelfRoleCommand');

require('dotenv').config({ path: `${__dirname}/.env` });

const { DEVELOPER_NEWS } = process.env;

module.exports = class DeveloperNewsCommand extends SelfRoleCommand {
  constructor(client) {
    super(client, {
      name: 'developer-news',
      group: 'mod',
      aliases: ['developernews', 'dev-news', 'devnews'],
      memberName: 'developer-news',
      description: 'Add/Remove the `@dev-news` role to/from yourself',
      argsPromptLimit: 0,
      args: [
        {
          key: 'action',
          type: 'string',
          prompt: '',
          default: 'show',
        },
      ],
    }, DEVELOPER_NEWS);
  }
};
