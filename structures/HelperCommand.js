const Command = require('./Command.js');

class HelperCommand extends Command {
    constructor(client, info, site, pages, answers) {
        super(client, info);

        this.site = site;
        this.pages = pages;
        this.answers = answers;
    }


    run(msg, { arg }) {
        let response = this.pages[arg];
        const prefix = msg.guild ? msg.guild.commandPrefix : '';

        if(response) {
            response = '**' + this.site + response + '**';

        } else if (arg === 'default') {
            response = this.answers[arg] || this.site;

        } else if (arg === 'options') {
            const options = Object.keys(this.pages).concat(Object.keys(this.answers));

            response = '**Command:** `' + prefix + this.name + '`' +
                '\n**Available options:** `' + options.sort().join('`, `') + '`' +
                '\n**See also:** <' + this.site + '>';

        } else if (this.answers && this.answers[arg]) {
            response = this.answers[arg];

        } else {
            response = '**Command:** `' + prefix + this.name + '`' +
                '\n**Invalid option:** `' + arg + '`' +
                '\nUse \`' + prefix + this.name + ' options\` to see all available options' +
                '\n**See also:** <' + this.site + '>';
        }

        return msg.say(response);
    }
};

module.exports = HelperCommand;
