const Command = require('../../structures/Command.js');

module.exports = class HexCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'hex',
            group: 'rautil',
            memberName: 'hex',
            description: 'Converts an integer from decimal to hexadecimal (or vice-versa).',
            examples: ['`hex 16`, `hex 0xaf 0x10`, `hex 4096 14 64`'],
            argsPromptLimit: 0,
            args: [
                {
                    key: 'numbers',
                    type: 'string',
                    infinite: true,
                    prompt: '',
                },
            ],
        });
    }

    async run(msg, { numbers }) {
        let response = '```';
        let num;

        for(let i = 0; i < numbers.length; i++) {
            num = parseInt(numbers[i]);

            if(!isNaN(num))
                response += `\n${num} = 0x${num.toString(16)}`;
            else
                response += `\n${numbers[i]} = NaN`;
        }

        response += '```';
        return msg.reply(response);
    }

};
