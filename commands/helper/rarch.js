const HelperCommand = require('../../structures/HelperCommand');

const { site, pages, answers } = require('../../assets/answers/rarch');

module.exports = class RarchCommand extends HelperCommand {
  constructor(client) {
    super(client, {
      name: 'rarch',
      group: 'helper',
      memberName: 'rarch',
      description: 'Provide basic info about RetroArch.',
      examples: ['`rarch nightly`', '`rarch cores`'],
      args: [
        {
          key: 'arg',
          prompt: '',
          type: 'string',
          default: 'default',
        },
      ],
    }, site, pages, answers);
  }
};
