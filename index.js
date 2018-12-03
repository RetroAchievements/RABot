require('dotenv').config({path: __dirname + '/.env'});
const { BOT_TOKEN, OWNERS, BOT_PREFIX, INVITE, BOT_NAME } = process.env;
const NEWS_ROLES = process.env.NEWS_ROLES.split(',');

const responses = require('./assets/answers/responses.js');
const checkFeed = require('./util/CheckFeed.js');
const { getGameList } = require('./util/GetGameList.js');

const regexRule2 = new RegExp('(' + require('./assets/json/badwordsRule2.json').join('|') + ')', 'i');
const talkedRecently = new Set();

const path = require('path');
const { CommandoClient } = require('discord.js-commando');
const client = new CommandoClient({
    commandPrefix: BOT_PREFIX,
    owner: OWNERS.split(','),
    invite: INVITE,
    disableEveryone: true,
    unknownCommandResponse: false,
    disabledEvents: ['TYPING_START']
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
    ])
    .registerDefaultCommands({
        ping: false,
        prefix: false,
        commandState: false
    })
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
    client.user.setUsername(BOT_NAME || 'RABot');
    console.log(`[READY] Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity('if you need help', { type: 'WATCHING' });
    checkFeed(client.channels);
    getGameList();
});

client.on('guildMemberAdd', member => member.setRoles(NEWS_ROLES).catch(console.error));

client.on('disconnect', event => {
    console.error(`[DISCONNECT] Disconnected with code ${event.code}.`);
    process.exit(0);
});

client.on('commandRun', command => console.log(`[COMMAND] Ran command ${command.groupID}:${command.memberName}.`));

client.on('error', err => console.error('[ERROR]', err));

client.on('warn', err => console.warn('[WARNING]', err));

client.on('commandError', (command, err) => console.error('[COMMAND ERROR]', command.name, err));

client.on('message', async (msg) => {
    if(msg.author.bot) return;
    if(msg.content.length <= 3) return;

    const content = msg.content.toLowerCase();
    if(responses[content]) {
        if( talkedRecently.has(msg.author.id) )
            return;
        talkedRecently.add(msg.author.id);
        setTimeout( () => {
            talkedRecently.delete(msg.author.id);
        }, 10000);

        return msg.reply(responses[content]);
    }

    // checking for Rule 2 badwords
    if(content.length >= 7 && content.match(regexRule2)) {
        try {
            await msg.react('🇷');
            await msg.react('🇺');
            await msg.react('🇱');
            await msg.react('🇪');
            await msg.react('2⃣');
        }
        catch (error) {
            console.error('[ERROR] Failed to react with "RULE2".');
        }
    }
});


client.login(BOT_TOKEN);

process.on('unhandledRejection', err => {
    console.error('[FATAL] Unhandled Promise Rejection.', err);
    process.exit(1);
});
