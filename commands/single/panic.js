const Command = require('../../structures/Command');

const { CHANNEL_OFFTOPIC } = process.env;

module.exports = class PanicCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'panic',
      group: 'single',
      memberName: 'panic',
      description: 'What to do when the site is down!',
    });
  }

  async run(msg) {
    const response = `${'😱\n**OH MY GOD!!! SOMETHING IS WRONG WITH THE SITE?!?! THE SITE IS DOWN?!?**'
      + "\nDon't panic mate. The problem will be solved at some point."
      + "\nWhile you can't earn cheevos, why not doing something in real life or maybe just chatting on "}${this.client.channels.get(CHANNEL_OFFTOPIC) || '#off-topic'}`;

    try {
      await msg.react('😱');
      return msg.reply(response);
    } catch (err) {
      return msg.reply(response);
    }
  }
};
