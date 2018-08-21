const Command = require('../../structures/Command.js');

module.exports = class HexCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'hex',
            group: 'rautil',
            memberName: 'hex',
            description: 'Converts a non-negative integer from decimal to hexadecimal (or vice-versa).',
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
        let outOfRangeFlag = false;

        for(let i = 0; i < numbers.length; i++) {
            num = parseInt(numbers[i]);

            if(!isNaN(num))
                if(num < 0) {
                    response += `\n${num} = negative`;
                    outOfRangeFlag = true;
                } else if(num > 4294967295) { // 2^32
                    response += `\n${numbers[i]} = TooBig!`;
                    outOfRangeFlag = true;
                } else { 
                    response += `\n${num} = 0x${num.toString(16)}`;
                }
            else
                response += `\n${numbers[i]} = NaN`;
        }

        response += '```';
        response += outOfRangeFlag ? '**Note**: use numbers between 0 and 4294967295 (which is `0xffffffff`)' : '';
                
        return msg.reply(response);
    }

};
