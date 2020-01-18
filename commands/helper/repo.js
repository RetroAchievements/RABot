const HelperCommand = require('../../structures/HelperCommand.js');

const { site, pages, answers } = require('../../assets/answers/repositories.js');

module.exports = class RepoCommand extends HelperCommand {
    constructor(client) {
        super(client, {
            name: 'repo',
            group: 'helper',
            memberName: 'repo',
            description: 'Provide links to RetroAchievements repositories.',
            examples: ['`repo ralibretro`', '`repo raintegration`', '`repo wiki`'],
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
