const Command = require('./Command.js');

class HelperCommand extends Command {
  constructor(client, info, site, pages, answers) {
    super(client, info);

    this.site = site;
    this.pages = pages;
    this.answers = answers;

    const options = Object.keys(this.pages).concat(Object.keys(this.answers));
    options.push('help');
    this.helpMessage = this.aliases.length > 0 ? `\n**Aliases:** \`${this.aliases.sort().join('`, `')}\`` : '';
    this.helpMessage += `\n**Available options:** \`${options.sort().join('`, `')}\``
            + `\n**See also:** <${this.site}>`;
  }


  run(msg, { arg }) {
    let response = this.pages[arg.toLowerCase()];
    const prefix = msg.guild ? msg.guild.commandPrefix : '';

    if (response) {
      response = `**${this.site}${response}**`;
    } else if (arg === 'default') {
      response = this.answers[arg] || this.site;
    } else if (arg === 'help' || arg === 'options') {
      response = `**Command:** \`${prefix}${this.name}\`${this.helpMessage}`;
    } else if (this.answers && this.answers[arg]) {
      response = this.answers[arg];
    } else {
      response = `**Command:** \`${prefix}${this.name}\``
                + `\n**Invalid option:** \`${arg}\``
                + `\nUse \`${prefix}${this.name} options\` to see all available options`
                + `\n**See also:** <${this.site}>`;
    }

    return msg.say(response);
  }
}

module.exports = HelperCommand;
