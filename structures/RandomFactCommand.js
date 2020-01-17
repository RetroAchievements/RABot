const Command = require('./Command.js');

let facts;

module.exports = class RandomFactCommand extends Command {
  constructor(client, info, factsFile) {
    super(client, info);
    this.throttling = { usages: 5, duration: 60 };
    this.facts = require(factsFile);
  }

  run(msg, { number }) {
    const { length } = this.facts;
    let num = parseInt(number);
    let i;
    let prefix = '';

    if (isNaN(num--) || num < 0 || num > length - 1) {
      i = Math.floor(Math.random() * length);
      if (number != '~NOARGS~') prefix = 'random: ';
      // return msg.say( ( number != ? 'random: ' : '' ) + '**' + this.facts[ Math.floor(Math.random() * length) ] + '**');
    } else {
      i = num;
      prefix = `${num + 1}: `;
    }

    return msg.say(`${prefix}**${this.facts[i]}**`);
  }
};
