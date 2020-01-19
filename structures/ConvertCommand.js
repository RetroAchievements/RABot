const Command = require('./Command.js');

module.exports = class ConvertCommand extends Command {
  constructor(client, info, base) {
    super(client, info);
    this.base = base;
  }

  async run(msg, { numbers }) {
    let response = '```';
    let nStr;
    let num;
    let binStr;
    let outOfRangeFlag = false;
    const basePrefix = this.base === 16 ? '0x' : this.base === 2 ? '0b' : '';

    for (let i = 0; i < numbers.length; i++) {
      nStr = numbers[i];
      num = parseInt(nStr);
      response += '\n';

      // dealing with binary numbers
      if (binStr = nStr.match(/^0b([01]+)$/i)) {
        // a trick to revert the string:
        binStr = binStr[1].split('').reverse().join('');

        if (nStr.length > 32) { // max 32 bits
          response += `${nStr} = TooBig!`;
          outOfRangeFlag = true;
          continue;
        }

        num = 0;
        for (let j = binStr.length - 1; j >= 0; j--) num += binStr[j] === '1' ? 2 ** j : 0;

        response += `0b${num.toString(2)} = 0x${num.toString(16)} = ${num}`;
        continue;
      }

      // this logic is able to deal with hex and decimals
      if (!isNaN(num)) {
        if (num < 0) {
          response += `${num} = negative`;
          outOfRangeFlag = true;
          continue;
        }

        if (num > 4294967295) { // 2^32
          response += `${nStr} = TooBig!`;
          outOfRangeFlag = true;
          continue;
        }

        if (nStr.startsWith('0x')) response += `0x${num.toString(16)} = ${this.base == 2 ? `0b${num.toString(2)}` : num}`;
        else response += `${num} = ${basePrefix}${num.toString(this.base)}`;
        continue;
      }
      response += `${nStr} = NaN`;
    }
    response += '```';

    if (outOfRangeFlag) response += '\n**Note**: use numbers between 0 and 4294967295 (which is `0xffffffff`)';

    return msg.channel.send(response);
  }
};
