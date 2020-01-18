const Command = require('../../structures/Command.js');
const { googleGameId } = require('../../util/Utils.js');

module.exports = class GameIdCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'tickets',
            aliases: ['ticket', 'tick', 'tkt'],
            group: 'rautil',
            memberName: 'tickets',
            description: 'Return the URL for the open tickets page of the given game name.',
            examples: ['`tickets street fighter mega drive`', '`tickets final fight arcade`'],
            throttling: {
                usages: 5,
                duration: 60,
            },
            args: [
                {
                    key: 'terms',
                    prompt: '',
                    type: 'string',
                    infinite: true,
                    default: '1',
                },
            ],
        });
    }

    async run(msg, { terms }) {
        const ticketsUrl = 'http://retroachievements.org/ticketmanager.php?g=';
        const sentMsg = await msg.reply(':hourglass: Getting info, please wait...');
        const gameid = await googleGameId(terms);
        const response = gameid > 0 ? (ticketsUrl + gameid) : "Didn't find anything... :frowning:";
        return sentMsg.edit(response);
    }
};
