require('dotenv').config({path: __dirname + '/.env'});
const { BOT_TOKEN, OWNERS, BOT_PREFIX, INVITE, BOT_NAME } = process.env;
const NEWS_ROLES = process.env.NEWS_ROLES.split(',');

const Discord = require('discord.js');
const logger = require('pino')({
    useLevelLabels:true,
    timestamp:()=>{
        return `,"time":"${new Date()}"`
    }
});
const responses = require('./assets/answers/responses.js');
//const checkFeed = require('./util/CheckFeed.js');
const { getGameList } = require('./util/GetGameList.js');
const { addMeme, removeMeme } = require('./util/MemeBoard.js');

const badwordsRule2JSON = require('./assets/json/badwordsRule2.json');

const regexRule2 = new RegExp('(' + badwordsRule2JSON.join('|') + ')', 'i');
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
        ['games', 'Play some games with the bot'],
    ])
    .registerDefaultCommands({
        ping: false,
        prefix: false,
        commandState: false
    })
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
    client.user.setUsername(BOT_NAME || 'RABot');
    logger.info(`[READY] Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity('if you need help', { type: 'WATCHING' });
    getGameList();
});

client.on('guildMemberAdd', async (member) => {
    await member.setRoles(NEWS_ROLES).catch(err => logger.error(err));
    const message = `Hello ${member.displayName}. Welcome to the RetroAchievements Discord server. Please verify your account by sending a message to RAdmin on the website asking to be verified (once verified, you'll have access to more channels).\nhttps://retroachievements.org/user/RAdmin`;
    member.send(message)
        .then(message => logger.info({msg: 'Sent message', msgID: message.id}))
        .catch(error => logger.error(error));
});

client.on('disconnect', event => {
    logger.error(`[DISCONNECT] Disconnected with code ${event.code}.`);
    process.exit(0);
});

client.on('commandRun', command => logger.info(`[COMMAND] Ran command ${command.groupID}:${command.memberName}.`));

client.on('error', err => logger.error(err));

client.on('warn', err => logger.warn(err));

client.on('commandError', (command, err) => logger.error({command:command.name, err}));

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
            logger.error({error,msg:'[ERROR] Failed to react with "RULE2".'});
        }
    }
});


// the code below is a workaround to keep listening for reactions on old
// messages (before the bot started).
// https://discordjs.guide/popular-topics/reactions.html#listening-for-reactions-on-old-messages
// --- START OF THE WORKAROUND ---
const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

client.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id) || await user.createDM();

    if (channel.messages.has(data.message_id)) return;

    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let reaction = message.reactions.get(emojiKey);

    if (!reaction) {
        const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
        reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }

    client.emit(events[event.t], reaction, user);
});

client.on('messageReactionAdd', (reaction, user) => addMeme(reaction, user) );

client.on('messageReactionRemove', (reaction, user) => removeMeme(reaction, user) );
// --- END OF THE WORKAROUND ---


client.login(BOT_TOKEN);

process.on('unhandledRejection', err => {
    logger.error(err);
    process.exit(1);
});
