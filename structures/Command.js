const { Command } = require('discord.js-commando');

class DefaultCommand extends Command {
  constructor(client, info) {
    super(client, info);

    this.argsPromptLimit = info.argsPromptLimit || 0;
    this.argsSingleQuotes = info.argsSingleQuotes || false;
    this.throttling = info.throttling || { usages: 3, duration: 10 };
  }
}

module.exports = DefaultCommand;
