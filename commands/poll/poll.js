const { Collection } = require('discord.js');
const Command = require('../../structures/Command.js');

const allOptions = Object.values(require('../../assets/json/emoji-alphabet.json'));

module.exports = class PollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'poll',
      group: 'poll',
      memberName: 'poll',
      description: 'Create a (useless) poll.',
      examples: ['`poll \'Which option you choose?\' \'option one\' \'option 2\' \'option N\'`'],
      argsSingleQuotes: true,
      argsPromptLimit: 0,
      args: [
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

  async run(msg, { question, opts }) {
    return this.client.registry.resolveCommand('poll:tpoll').run(msg, { seconds: 0, question, opts });
  }
};
