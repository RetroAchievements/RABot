const commando = require('discord.js-commando');

module.exports = class ApiTestCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'community-example',
            aliases: ['communityexample'],
            group: 'util',
            memberName: 'community-example',
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
        msg.channel.send('hey there!')
            .then(message => {
                // delete message after 7 seconds
                // setTimeout(() => {
                //     message.delete();
                // }, 7000);
            })
            .catch(() => {
            });
    }
};
