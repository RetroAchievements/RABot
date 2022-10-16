require('dotenv').config({ path: `${__dirname}/.env` });

const {
  BOT_TOKEN, OWNERS, BOT_PREFIX, INVITE, BOT_NAME,
} = process.env;

const logger = require('pino')({
  useLevelLabels: true,
  timestamp: () => `,"time":"${new Date()}"`,
});
const path = require('path');
const { CommandoClient } = require('discord.js-commando');
const responses = require('./assets/answers/responses');

// eslint-disable-next-line
const badwordsRule2JSON = require('./assets/json/badwordsRule2.json');

const regexRule2 = new RegExp(`(${badwordsRule2JSON.join('|')})`, 'i');
const talkedRecently = new Set();

const client = new CommandoClient({
  commandPrefix: BOT_PREFIX,
  owner: OWNERS.split(','),
  invite: INVITE,
  disableEveryone: true,
  unknownCommandResponse: false,
  disabledEvents: ['TYPING_START'],
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['util', 'Utilities'],
    ['helper', 'Helping you to help others'],
    ['single', 'Single (and simple) commands'],
    ['poll', 'Commands for polls'],
    ['rautil', 'RetroAchievements utilities'],
    ['search', 'Search for things'],
    ['mod', 'Moderation utilities'],
    ['random', 'Random stuff'],
    ['games', 'Play some games with the bot'],
  ])
  .registerDefaultCommands({
    ping: false,
    prefix: false,
    commandState: false,
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
  client.user.setUsername(BOT_NAME || 'RABot');
  logger.info(`[READY] Logged in as ${client.user.tag}! (${client.user.id})`);
  client.user.setActivity('if you need help', { type: 'WATCHING' });
});

client.on('guildMemberAdd', async (member) => {
  const message = `Hello ${member.displayName}. Welcome to the RetroAchievements Discord server. Please verify your account by sending a message to RAdmin on the website asking to be verified (once verified, you'll have access to more channels).\nhttps://retroachievements.org/user/RAdmin`;
  member.send(message)
    .then((msg) => logger.info({ msg: 'Sent message', msgID: msg.id }))
    .catch((error) => logger.error(error));
});

client.on('disconnect', (event) => {
  logger.error(`[DISCONNECT] Disconnected with code ${event.code}.`);
  process.exit(0);
});

client.on('commandRun', (command) => logger.info(`[COMMAND] Ran command ${command.groupID}:${command.memberName}.`));

client.on('error', (err) => logger.error(err));

client.on('warn', (err) => logger.warn(err));

client.on('commandError', (command, err) => logger.error({ command: command.name, err }));

client.on('message', async (msg) => {
  if (msg.author.bot) return;
  if (msg.content.length <= 3) return;

  const content = msg.content.toLowerCase();
  if (responses[content]) {
    if (talkedRecently.has(msg.author.id)) { return; }
    talkedRecently.add(msg.author.id);
    setTimeout(() => {
      talkedRecently.delete(msg.author.id);
    }, 10000);

    msg.reply(responses[content]);
  }

  // checking for Rule 2 badwords
  if (regexRule2.length && content.length >= 7 && content.match(regexRule2)) {
    try {
      await msg.react('🇷');
      await msg.react('🇺');
      await msg.react('🇱');
      await msg.react('🇪');
      await msg.react('2⃣');
    } catch (error) {
      logger.error({ error, msg: '[ERROR] Failed to react with "RULE2".' });
    }
  }
});

client.login(BOT_TOKEN);

process.on('unhandledRejection', (err) => {
  logger.error(err);
  process.exit(1);
});
