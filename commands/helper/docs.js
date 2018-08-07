const HelperCommand = require('../../structures/HelperCommand.js');

const { site, pages, answers } = require('../../assets/answers/docs.js');

module.exports = class DocsCommand extends HelperCommand {
    constructor(client) {
        super(client, {
            name: 'docs',
            group: 'helper',
            aliases: ['d', 'doc'],
            memberName: 'docs',
            description: 'Provide links to RetroAchievements documentation.',
            examples: ['`docs jrdev`', '`docs resetif`', '`docs delta`'],
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
