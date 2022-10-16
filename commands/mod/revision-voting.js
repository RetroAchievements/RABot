const SelfRoleCommand = require('../../structures/SelfRoleCommand');

require('dotenv').config({ path: `${__dirname}/.env` });

const { REVISION_VOTING } = process.env;

module.exports = class RevisionVotingCommand extends SelfRoleCommand {
  constructor(client) {
    super(client, {
      name: 'revision-voting',
      group: 'mod',
      aliases: ['revisionvoting', 'rev-voting'],
      memberName: 'revision-voting',
      description: 'Add/Remove the `@revision-voting` role to/from yourself',
      argsPromptLimit: 0,
      args: [
        {
          key: 'action',
          type: 'string',
          prompt: '',
          default: 'show',
        },
      ],
    }, REVISION_VOTING);
  }
};
