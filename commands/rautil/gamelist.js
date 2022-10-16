const HelperCommand = require('../../structures/HelperCommand');

const { site, pages, answers } = require('../../assets/answers/consoles');

module.exports = class GameListCommand extends HelperCommand {
  constructor(client) {
    super(client, {
      name: 'gamelist',
      aliases: ['gl'],
      group: 'rautil',
      memberName: 'gamelist',
      description: 'Link to the list of supported games.',
      examples: ['`gl nes`', '`gl megadrive`', '`gl arcade`'],
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
