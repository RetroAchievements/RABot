const Command = require('../../structures/Command.js');

module.exports = class PollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'poll',
      group: 'poll',
      memberName: 'poll',
      description: 'Create a poll. Can be set hidden or not',
      examples: ['`poll yes \'Which option you choose?\' \'option one\' \'option 2\' \'option N\'`', '`poll no \'Which option you choose?\' \'option one\' \'option 2\' \'option N\'`'],
      argsSingleQuotes: true,
      argsPromptLimit: 0,
      args: [
        {
          key: 'hidden',
          type: 'string',
          prompt: '',
          default: 'no',
        },
        {
          key: 'question',
          type: 'string',
          prompt: '',
          validate: (question) => {
            if (question.length > 0 && question.length < 400) return true;
            return 'Invalid question';
          },
        },
        {
          key: 'opts',
          prompt: '',
          type: 'string',
          infinite: true,
          default: '~NO~OPTS~',
        },
      ],
    });
  }

  async run(msg, { hidden, question, opts }) {
    return this.client.registry.resolveCommand('poll:tpoll').run(msg, {
      seconds: 0, hidden, question, opts,
    });
  }
};
