const Command = require('../../structures/Command.js');
const { RichEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { RA_USER, RA_TOKEN, RA_WEB_API_KEY, CHANNEL_DEV_CHANNELS } = process.env;

const devChannels = process.env.CHANNEL_DEV_CHANNELS.split(',');

const baseUrl = 'https://retroachievements.org/'

const maxChars = 6;

const finishleveln = '0xhlevel=n.1._0xhlevel=n+1_0xhlevel>d0xhlevel_R:0xhlevel<d0xhlevel';
const templates = {
    finishlevel: finishleveln,
    finishlevelbeforetime: finishleveln + '_0xhtime>=t',
    finishlevelnodeath: finishleveln + '_0xhscreen=lvlintro.1._R:0xhlife<d0xhlife',
    finishlevelwithitem: finishleveln + '_0xhitem=true',
    collectitem: '0xhitem=false.1._0xhitem=true_R:0xhlevel!=0xhlevel',
    changevalue: 'd:0xhaddress=v1.n._0xhaddress=v2.n._P:0xhaddress=0xhaddress'
}

const specialFlags = {
    'r': 'ResetIf',
    'p': 'PauseIf',
    'a': 'AddSource',
    'b': 'SubSource',
    'c': 'AddHits',
    'n': 'AndNext',
    'm': 'Measured',
    'i': 'AddAddress',
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
    '0xw': '24-bit',
    '0xx': '32-bit', // needs to be before the 16bits below to make the RegEx work
    '0x ': '16-bit',
    '0x' : '16-bit',
    'h'  : '',       // this means hex notation for values
    ''   : ''
};

const memTypes = {
    'd': 'Delta',
    'p': 'Prior',
    'm': 'Mem',
    'v': 'Value',
    '' : ''
};


const operandRegex = 
  '(d|p)?(' +
  Object.keys(memSize).join('|') + 
  ')?([0-9a-z+-]*)';

const memRegex = new RegExp(
  '(?:([' +
  Object.keys(specialFlags).join('') +
  ']):)?' +
  operandRegex +
  '(<=|>=|<|>|=|!=)?' +
  operandRegex +
  '(?:[(.]([0-9a-z]+)[).])?',
  'i'
);


module.exports = class ParseMemCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'parsemem',
            aliases: ['mem'],
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

    async run( msg, { mem } ) {
        // group2: achievementId
        const achievementUrlRegex = /^<?(https?:\/\/)?retroachievements\.org\/achievement\/([0-9]+)>?$/i;

        let reply;
        let memLowerCase = mem[0].toLowerCase();
        let achievementId;

        try {
            if (achievementId = memLowerCase.match(achievementUrlRegex)) {
                achievementId = parseInt(achievementId[2]);
                if (achievementId <= 0) {
                    return msg.reply('Invalid achievement ID');
                }

                const sentMsg = await msg.reply(`:hourglass: Getting MemAddr for achievement ID **${achievementId}**, please wait...`);

                const gameId = await this.getGameId(achievementId);
                if (achievementId <= 0) {
                    return sentMsg.edit(`**Whoops!**\nI didn't find the game ID for achievement ID **${achievementId}**.`);
                }

                const memAddr = await this.getMemAddr(gameId, achievementId);
                if (!memAddr) {
                    return sentMsg.edit(`**Whoops!**\nI didn't find the MemAddr for achievement ID **${achievementId}**.`);
                }

                const addresses = [];
                reply = await this.parsemem(memAddr, addresses);

                if (addresses.length > 0 && devChannels.includes(msg.channel.id)) {
                    const codeNotesEmbed = await this.getCodeNotesEmbed(gameId, addresses);
                    return sentMsg.edit(reply, codeNotesEmbed);
                }

                return sentMsg.edit(reply);
            } else if( memLowerCase === "templates" ) {
                reply = '**Templates available**: `' + Object.keys(templates).join('`, `') + '`';
            } else if( Object.keys(templates).includes(mem[0].toLowerCase()) ) {
                reply = this.parsemem( templates[mem[0].toLowerCase()] );
            } else {
                reply = this.parsemem( mem.join(' ') );
            }
        } catch(error) {
            reply = `**Whoops!**\n${error.message}\nCheck your MemAddr string and try again.`;
        }
        return msg.reply(reply);
    }

    async parsemem(mem, addresses) {
        const collectAddresses = Array.isArray(addresses);
        const groups = mem.split(/(?<!0x)S/); // <-- pure JavaScript doesn't support lookbehind RegEx
        //const groups = mem.split(/(^(?!0x$).).+S/); // https://stackoverflow.com/a/7376273/6354514
        let reqs;
        let parsedReq;
        let reqNum, flag, lType, lSize, lMemory, cmp, rType, rSize, rMemVal, hits;
        let num;
        let countLines = 0;
        let res = '\n';

        for( let i = 0; i < groups.length; i++ ) {
            res += i == 0 ? '__**Core Group**__:' : `__**Alt Group ${i}**__:`;
            res += '```';

            reqs = groups[i].split('_');
            countLines += reqs.length;
            if( countLines > 20 )
                return "I'm unable to handle this, it's TOO BIG!";

            for( let j = 0; j < reqs.length; j++ ) {
                reqNum = j + 1;
                parsedReq = reqs[j].match(memRegex);
                if( !parsedReq )
                    return `invalid "Mem" string: \`${mem}\`\nI've failed to parse this: \`${reqs[j]}\`\n**Note**: strings for address/value should be lowercased`;

                flag =    parsedReq[1] ? parsedReq[1].toLowerCase() : '';
                lType =   parsedReq[2] ? parsedReq[2].toLowerCase() : '';
                lSize =   parsedReq[3] ? parsedReq[3].toLowerCase() : '';
                lMemory = parsedReq[4] || '';
                cmp =     parsedReq[5] || '=';
                rType =   parsedReq[6] ? parsedReq[6].toLowerCase() : '';
                rSize =   parsedReq[7] ? parsedReq[7].toLowerCase() : '';
                rMemVal = parsedReq[8] || '';
                hits =    parsedReq[9] || '0';

                if( lSize == '' ) {
                    num = parseInt(lMemory).toString(16);
                    if(!isNaN('0x' + num)) lMemory = num;
                }
                lMemory = '0x' + lMemory.substring(0, maxChars+2).padStart(maxChars, '0');
                if( rSize == '' ){
                    num = parseInt(rMemVal).toString(16);
                    if(!isNaN('0x' + num)) rMemVal = num;
                }
                rMemVal = '0x' + rMemVal.substring(0, maxChars+2).padStart(maxChars, '0');

                if( lType !== 'd' && lType !== 'p')
                    lType = ( lSize == '' || lSize == 'h' ) ? 'v' : 'm';
                if( rType !== 'd' && rType !== 'p')
                    rType = ( rSize == '' || rSize == 'h' ) ? 'v' : 'm';

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

                if (collectAddresses) {
                    if (lType && lType != 'v' && !addresses.includes(lMemory)) {
                        addresses.push(lMemory);
                    }
                    if (lType && rType != 'v' && !addresses.includes(rMemory)) {
                        addresses.push(rMemory);
                    }
                }
            } // end of for looping through requirements in a group
            res += '```';
        } // end of for looping through groups in an achievement
        return res;
    }


    async getGameId(achievementId) {
        const achievementUnlocksUrl = `${baseUrl}API/API_GetAchievementUnlocks.php?z=${RA_USER}&y=${RA_WEB_API_KEY}&a=${achievementId}`;
        return await fetch(achievementUnlocksUrl)
            .then(res => res.json())
            .then(res => parseInt(res.Game.ID))
            .catch(err => null);

    }


    async getMemAddr(gameId, achievementId) {
        const dorequestPatchUrl = `${baseUrl}dorequest.php?r=patch&g=${gameId}&u=${RA_USER}&t=${RA_TOKEN}`;
        return await fetch(dorequestPatchUrl)
            .then(res => res.json())
            .then(res => res.PatchData.Achievements.find(ach => ach.ID == achievementId).MemAddr)
            .catch(err => null);
    }


    async getCodeNotes(gameId) {
        const dorequestCodeNotesUrl = `${baseUrl}dorequest.php?r=codenotes2&g=${gameId}&u=${RA_USER}&t=${RA_TOKEN}`;
        return await fetch(dorequestCodeNotesUrl)
            .then(res => res.json())
            .then(res => res.CodeNotes)
            .catch(err => null);
    }


    async getCodeNotesEmbed(gameId, addresses) {
        let hasNote = false;
        const codeNotes = await this.getCodeNotes(gameId);
        const codeNotesEmbed = new RichEmbed()
            .setColor('#3498DB')
            .setTitle('Code Notes')
            .setURL(`${baseUrl}codenotes.php?g=${gameId}`);

        try {
            addresses.forEach(addr => {
                const codeNote = codeNotes.find(note => note.Address == addr);
                if (codeNote) {
                    hasNote = true;
                    codeNotesEmbed.addField(`**${addr}**`, codeNote.Note, true);
                }
            });
            return hasNote ? codeNotesEmbed : undefined;
        } catch(err) {
            return undefined;
        }
    }
}
