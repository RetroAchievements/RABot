const HelperCommand = require('../../structures/HelperCommand.js');

const { site, pages } = require('../../assets/answers/faq.js');

module.exports = class FaqCommand extends HelperCommand {
    constructor(client) {
        super(client, {
            name: 'faq',
            group: 'helper',
            aliases: ['f'],
            memberName: 'faq',
            description: 'Provide links to the FAQ.',
            examples: ['`faq emu`', '`faq tickets`', '`faq cheat`'],
            args: [
                {   
                    key: 'arg',
                    prompt: '',
                    type: 'string',
                    default: 'default',
                }
            ]
            }, site, pages);
    }

};
