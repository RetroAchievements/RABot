const SelfRoleCommand = require('../../structures/SelfRoleCommand.js');

require('dotenv').config({ path: `${__dirname}/.env` });

const { ACHIEVEMENT_NEWS } = process.env;


module.exports = class AchievementNewsCommand extends SelfRoleCommand {
    constructor(client) {
        super(client, {
            name: 'achievement-news',
            group: 'mod',
            aliases: ['achievementnews', 'achnews'],
            memberName: 'achievement-news',
            description: 'Add/Remove the `@achievement-news` role to/from yourself',
            argsPromptLimit: 0,
            args: [
                {
                    key: 'action',
                    type: 'string',
                    prompt: '',
                    default: 'show',
                },
            ],
        }, ACHIEVEMENT_NEWS);
    }
};
