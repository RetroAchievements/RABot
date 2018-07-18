const commando = require('discord.js-commando');
const path = require('path');

require('dotenv').config({path: __dirname + '/.env'});

const client = new commando.Client({
    owner: process.env.DISCORD_OWNER_ID,
    commandPrefix: process.env.DISCORD_BOT_PREFIX,
});

client.registry
    .registerGroups([
        ['community', 'Community'],
        ['util', 'Util'],
    ])
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, 'src/commands'));

client.on('message', message => {
    if (message.content === 'what is my avatar') {
        message.reply(message.author.avatarURL);
    }
});

client.on('ready', () => {
    console.info('I am ready! Prefix: ' + process.env.DISCORD_BOT_PREFIX);
});

client.login(process.env.DISCORD_TOKEN);
