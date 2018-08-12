const HelperCommand = require('../../structures/HelperCommand.js');

const { site, pages, answers } = require('../../assets/answers/consoles.js');

module.exports = class GameListCommand extends HelperCommand {
    constructor(client) {
        super(client, {
            name: 'gamelist',
            group: 'rautil',
            aliases: ['gl'],
            memberName: 'gamelist',
            description: 'Link to supported games.',
            examples: ['`gl nes`', '`gl megadrive`', '`gl arcade`'],
            args: [
                {   
                    key: 'arg',
                    prompt: '',
                    type: 'string',
                    default: 'default',
                }
            ]
            }, site, pages, answers);
    }

};
