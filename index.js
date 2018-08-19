require('dotenv').config({path: __dirname + '/.env'});
const { BOT_TOKEN, OWNERS, BOT_PREFIX, INVITE, BOT_NAME } = process.env;

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
});

client.on('disconnect', event => {
    console.error(`[DISCONNECT] Disconnected with code ${event.code}.`);
    process.exit(0);
});

client.on('commandRun', command => console.log(`[COMMAND] Ran command ${command.groupID}:${command.memberName}.`));

client.on('error', err => console.error('[ERROR]', err));

client.on('warn', err => console.warn('[WARNING]', err));

client.on('commandError', (command, err) => console.error('[COMMAND ERROR]', command.name, err));


const responses = require('./assets/answers/responses.js');

client.on('message', msg => {
    // TODO: add a 'cooldown' logic
    // https://anidiots.guide/examples/miscellaneous-examples#command-cooldown
    if(!msg.author.bot && responses[msg.content])
        return msg.reply(responses[msg.content]);
    return;
});


client.login(BOT_TOKEN);

process.on('unhandledRejection', err => {
    console.error('[FATAL] Unhandled Promise Rejection.', err);
    process.exit(1);
});
