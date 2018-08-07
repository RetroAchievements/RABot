require('dotenv').config({path: __dirname + '/.env'});
const { BOT_TOKEN, OWNERS, BOT_PREFIX, INVITE } = process.env;

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
        ['util', 'placeholder'],
        ['helper', 'Helping you to help others'],
        ['rautils', 'RetroAchievements utilities']
    ])
    .registerDefaultCommands({
        ping: false,
        prefix: false,
        commandState: false
    })
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
    console.log(`[READY] Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity('if you need help', { type: 'WATCHING' });
});

client.on('disconnect', event => {
    console.error(`[DISCONNECT] Disconnected with code ${event.code}.`);
    process.exit(0);
});

client.on('commandRun', command => console.log(`[COMMAND] Ran command ${command.groupID}:${command.memberName}.`));

client.on('error', err => console.error('[ERROR]', err));

client.on('warn', err => console.warn('[WARNING]', err));

client.on('commandError', (command, err) => console.error('[COMMAND ERROR]', command.name, err));

client.login(BOT_TOKEN);

process.on('unhandledRejection', err => {
    console.error('[FATAL] Unhandled Promise Rejection.', err);
    process.exit(1);
});
