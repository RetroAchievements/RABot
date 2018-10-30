const Command = require('../../structures/Command.js');
const crypto = require('crypto');

module.exports = class Md5Command extends Command {
    constructor(client) {
        super(client, {
            name: 'md5',
            group: 'rautil',
            memberName: 'md5',
            description: 'Generates an md5 hash for the strings given as arguments.',
            examples: ['`md5 dino`', '`md5 mvsc`' ],
            args: [
                {
                    key: 'terms',
                    prompt: '',
                    type: 'string',
                    infinite: true,
                    default: '1',
                },
            ]
        });
    }

    run(msg, { terms } ) {
        let reply = '';
        terms.forEach(term =>
            reply += `md5(\`${term}\`) = \`${crypto.createHash('md5').update(data).digest('hex')}\`);

        return msg.reply(reply);
    }
};
