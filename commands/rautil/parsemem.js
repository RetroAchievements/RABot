const Command = require('../../structures/Command.js');

const specialFlags = {
    'r': 'ResetIf',
    'p': 'PauseIf',
    'a': 'AddSource',
    'b': 'SubSource',
    'c': 'AddHits',
    '' : ''
};

const memSize = {
    '0xm': 'Bit0',
    '0xn': 'Bit1',
    '0xo': 'Bit2',
    '0xp': 'Bit3',
    '0xq': 'Bit4',
    '0xr': 'Bit5',
    '0xs': 'Bit6',
    '0xt': 'Bit7',
    '0xl': 'Lower4',
    '0xu': 'Upper4',
    '0xh': '8-bit',
    '0xx': '32-bit', // needs to be before the 16bits below to make the RegEx work
    '0x ': '16-bit',
    '0x' : '16-bit',
    '': ''
};

const memTypes = {
    'd': 'Delta',
    'm': 'Mem',
    'v': 'Value',
    '' : ''
};

const operandRegex = '(d)?(' + Object.keys(memSize).join('|') + ')?([0-9a-f]*)';
const memRegex = new RegExp('(?:([' + Object.keys(specialFlags).join('') + ']):)?' + operandRegex + '(<=|>=|<|>|=|!=)' + operandRegex + '(?:[(.](\\d+)[).])?', 'i');


module.exports = class ParseMemCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'parsemem',
            aliases: ['pmem', 'mem'],
            group: 'rautil',
            memberName: 'parsemem',
            description: 'Parse a "MemAddr" string and show the respective logic.',
            examples: ['`mem R:0xH00175b=73_0xH0081f9=0S0xH00b241=164.40._P:d0xH00b241=164S0xH00a23f=164.40._P:d0xH00a23f=164`'],
            throttling: {
                usages: 5,
                duration: 60
            },
            args: [
                {
                    key: 'mem',
                    prompt: '',
                    type: 'string',
                    infinite: true
                },
            ]
        });
    }

    run( msg, { mem } ) {
        let reply;
        try {
            reply = this.parsemem( mem.join(' ') );
        } catch(error) {
            reply = '**Whoops! Something went wrong!**\nCheck your MemAddr string and try again.'
        }
        return msg.reply(reply);
    }

    parsemem( mem ) {
        const groups = mem.split(/(?<!0x)S/);
        let reqs;
        let parsedReq;
        let reqNum, flag, lType, lSize, lMemory, cmp, rType, rSize, rMemVal, hits;
        let countLines = 0;
        let res = '';

        for( let i = 0; i < groups.length; i++ ) {
            res += i == 0 ? '__**Core Group**__:' : `__**Alt Group ${i}**__:`;
            res += '```';

            reqs = groups[i].split('_');
            countLines += reqs.length;
            if( countLines > 20 ) {
                return "I'm unable to handle this, it's TOO BIG!";
            }
            for( let j = 0; j < reqs.length; j++ ) {
                reqNum = j + 1;
                parsedReq = reqs[j].match(memRegex);
                flag =    parsedReq[1] ? parsedReq[1].toLowerCase() : '';
                lType =   parsedReq[2] ? parsedReq[2].toLowerCase() : '';
                lSize =   parsedReq[3] ? parsedReq[3].toLowerCase() : '';
                lMemory = parsedReq[4] || '';
                cmp =     parsedReq[5] || '';
                rType =   parsedReq[6] ? parsedReq[6].toLowerCase() : '';
                rSize =   parsedReq[7] ? parsedReq[7].toLowerCase() : '';
                rMemVal = parsedReq[8] || '';
                hits =    parsedReq[9] || '0';

                lMemory = lSize ? lMemory : lMemory.toString(16);
                lMemory = '0x' + lMemory.padStart(6, '0');
                rMemVal = rSize ? rMemVal : rMemVal.toString(16);
                rMemVal = '0x' + rMemVal.padStart(6, '0');

                if( lType !== 'd' )
                    lType = lSize == '' ? 'v' : 'm';
                if( rType !== 'd' )
                    rType = rSize == '' ? 'v' : 'm';

                res += '\n' + reqNum.toString().padStart(2, ' ') + ':';
                res += specialFlags[flag].padEnd(10, ' ');
                res += memTypes[lType].padEnd(6, ' ');
                res += memSize[lSize].padEnd(7, ' ');
                res += lMemory + ' ';
                if( flag == 'A' || flag == 'B' ) {
                    res += '\n';
                } else {
                    res += cmp.padEnd(3, ' ');
                    res += memTypes[rType].padEnd(6, ' ');
                    res += memSize[rSize].padEnd(7, ' ');
                    res += rMemVal + ' ';
                    res += ' (' + hits + ')';
                }
            }
            res += '```';
        }
        return res;
    }

}
