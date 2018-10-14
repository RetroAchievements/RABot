const Command = require('./Command.js');

let facts;

module.exports = class FunFactCommand extends Command {
    constructor(client, info, factsFile) {
        super(client, info);
        this.throttling = { usages: 5, duration: 60, };
        this.facts = require(factsFile);
    }

    run(msg, { number }) {
        let num = parseInt( number );
        const length = this.facts.length;

        if( isNaN( num-- ) || num < 0 || num > length - 1 )
            return msg.say('**' + this.facts[ Math.floor(Math.random() * length) ] + '**');

        return msg.say(`${num + 1}: **${this.facts[ num ]}**`);
    }
};
