const SelfRoleCommand = require('../../structures/SelfRoleCommand.js');

require('dotenv').config({path: __dirname + '/.env'});
const { COMMUNITY_NEWS } = process.env;


module.exports = class CommunityNewsCommand extends SelfRoleCommand {
    constructor(client) {
        super(client, {
            name: 'community-news',
            group: 'mod',
            aliases: ['communitynews', 'commienews'],
            memberName: 'community-news',
            description: 'Add/Remove the `@community-news` role to/from yourself',
            argsPromptLimit: 0,
            args: [
                {
                    key: 'action',
                    type: 'string',
                    prompt: '',
                    default: 'show',
                },
            ],
        }, COMMUNITY_NEWS);
    }
};
