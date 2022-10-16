const request = require('node-superfetch');
const Command = require('../../structures/Command');

const { YANDEX_KEY } = process.env;

const codes = require('../../assets/json/translate.json');

const codesList = `\`${Object.keys(codes).sort().join('`, `')}\``;

module.exports = class TranslateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'translate',
      aliases: ['tr', 'yandex'],
      group: 'util',
      memberName: 'translate',
      description: 'Translates text to a specific language. **Powered by <https://translate.yandex.com/>**',
      examples: [
        '`translate "quero um hot dog" en pt`',
        '`tr "if the language is easy to be detected, the last argument is optional" de`',
        '`tr capisce? en`',
      ],
      details: `__Language Codes:__ ${codesList}`,
      clientPermissions: ['EMBED_LINKS'],
      argsPromptLimit: 2,
      args: [
        {
          key: 'text',
          prompt: 'What text would you like to translate?',
          type: 'string',
          max: 500,
        },
        {
          key: 'target',
          prompt: `Which language would you like to translate to?\nOptions: ${codesList}.`,
          type: 'string',
          validate: (target) => {
            const value = target.toLowerCase();
            if (codes[value] || Object.keys(codes).find((key) => codes[key].toLowerCase() === value)) return true;
            return 'Invalid target language, please enter a valid language code.';
          },
          parse: (target) => {
            const value = target.toLowerCase();
            if (codes[value]) return value;
            return Object.keys(codes).find((key) => codes[key].toLowerCase() === value);
          },
        },
        {
          key: 'base',
          prompt: `Which language would you like to use as the base? Either ${codesList}.`,
          type: 'string',
          default: '',
          validate: (base) => {
            const value = base.toLowerCase();
            if (codes[value] || Object.keys(codes).find((key) => codes[key].toLowerCase() === value)) return true;
            return 'Invalid base language, please enter a valid language code.';
          },
          parse: (base) => {
            const value = base.toLowerCase();
            if (codes[value]) return value;
            return Object.keys(codes).find((key) => codes[key].toLowerCase() === value);
          },
        },
      ],
    });
  }

  async run(msg, { text, target, base }) {
    const sentMsg = await msg.reply('Getting the translation from <https://translate.yandex.com/>...');
    try {
      const { body } = await request
        .get('https://translate.yandex.net/api/v1.5/tr.json/translate')
        .query({
          key: YANDEX_KEY,
          text,
          lang: base ? `${base}-${target}` : target,
        });
      const lang = body.lang.split('-');
      return sentMsg.edit(
        `**From ${codes[lang[0]]}:\n\`${text}\`**\n\n`
                + `**To ${codes[lang[1]]}:\n\`${body.text[0]}\`**`,
      );
    } catch (err) {
      return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
    }
  }
};
