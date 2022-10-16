const RandomFactCommand = require('../../structures/RandomFactCommand');

module.exports = class FunFactCommand extends RandomFactCommand {
  constructor(client) {
    super(client, {
      name: 'funfact',
      aliases: ['ffact', 'funf'],
      group: 'random',
      memberName: 'funfact',
      description: 'Responds with a retrogaming fun fact.',
      args: [
        {
          key: 'number',
          prompt: '',
          type: 'string',
          default: '~NOARGS~',
        },
      ],
    }, '../assets/json/funfacts.json');
  }
};
