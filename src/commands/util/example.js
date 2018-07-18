const commando = require('discord.js-commando');

module.exports = class ApiTestCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'util-example',
            aliases: ['utilexample'],
            group: 'util',
            memberName: 'util-example',
            description: "Example util command.",
            examples: [],
            guildOnly: false,
            msg: null,
            args: null,
            accessToken: false,
            // args: [
            // ]
        });
    }

    hasPermission(msg) {
        /**
         * bot owner only
         */
        // return this.client.isOwner(msg.author);

        /**
         * everyone
         */
        return true;
    }

    async run(msg, args) {
        msg.channel.post('heyo!');
    }
};
