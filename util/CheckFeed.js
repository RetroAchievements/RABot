require('dotenv').config({path: __dirname + '/.env'});
const {
    CHEEVO_WARNING_NUM,
    CHEEVO_SUSPICIOUS_NUM,
    CHANNEL_MASTERY,
    CHANNEL_UNLOCKS,
    CHANNEL_TICKETS,
    GLOBAL_FEED_INTERVAL,
    NEWS_FEED_INTERVAL
} = process.env

const { RichEmbed } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();
const raorg = 'https://retroachievements.org';
const globalFeed = `${raorg}/rss-activity`;
const newsFeed = `${raorg}/rss-news`;

// regexEarned: capture (1)  everything before " earned " followed by anything,
//              then the number of points in parentheses, then " in ",
//              then capture (2) the game title. 'i' for case insensitive matching.
const regexEarned = /^([^ ]+) earned .* \([0-9]+\) in (.*)$/i;

// regexTicket: 
// TODO: improve this regex
//const regexTicket = /^([^ ]+) (opened|closed) a ticket for (.*) in (.*)$/i;
const regexTicket = /org\/userpic\/([^'"]+).*org\/user\/([^'"]+).* (opened|closed) a ticket for .*org\/achievement\/([0-9]+)['"]>([^<]+).* in .*>(.*)</is;

// regexCompleted:  capture (1) the userpic filename, then capture (2) the user name
//                  followed by " completed ", then capture (3) the game ID, then
//                  capture (4) the game title, then capture (5) the console name.
//                  'i' for case insensitive matching and 's' for including newlines.
const regexCompleted = /org\/userpic\/([^'"]+).*org\/user\/([^'"]+).* completed .*org\/game\/([0-9]+)['"]>([^<]+).*\(([ a-zA-Z0-9]+)\)/is;

let lastActivity = new Date('2018');
let masteryChannel, unlocksChannel, ticketsChannel;
let counterMap = new Map();


async function checkGlobalFeed() {
    const feed = await parser.parseURL(globalFeed);
    const items = feed.items;
    const newestTime = new Date(items[0].pubDate);
    const oldestTime = new Date(items[items.length - 1].pubDate);
    let userCheevoTimes = new Map();
    let userCheevoGames = new Map();
    let parsedString, user, game, system, msg;

    for(let i = items.length - 1; i >= 0; i--) {
        const pubDate = new Date(items[i].pubDate);

        // checking for multiple unlocks
        parsedString = items[i].title.match(regexEarned);
        if(parsedString) {
            user = parsedString[1];
            game = parsedString[2];

            if(!userCheevoTimes.has(user)) {
                userCheevoTimes.set(user, [ pubDate ] );
                userCheevoGames.set(user, [ game ] );
            } else {
                userCheevoTimes.get(user).push(pubDate);
                if(!userCheevoGames.get(user).includes(game))
                    userCheevoGames.get(user).push(game);
            }
            continue; // if it's an 'earned' item, no need to check for mastery
        }

        // no need to check mastery/ticket activity again
        if(pubDate.getTime() < lastActivity.getTime())
            continue;

        // checking for mastery
        parsedString = items[i].content.match(regexCompleted);
        if(parsedString) {
            const userPic = parsedString[1];
            const user = parsedString[2];
            const gameid = parsedString[3]
            const game = parsedString[4];
            const system = parsedString[5];

            // announce mastery
            msg = new RichEmbed()
                .setTitle('Mastery!')
                .setURL(`${raorg}/user/${user}`)
                .setThumbnail(`${raorg}/UserPic/${userPic}`)
                .setDescription(`Let's hear a round of applause for **${user}**'s mastery of **${game}** for **${system}**!\n\nCongratulate the player:\n${raorg}/user/${user}\nTry the game:\n${raorg}/game/${gameid}`)

            masteryChannel.send(msg);
            continue; // if it's a mastery item, no need to check further
        }

        // checking for ticket activity
        parsedString = items[i].content.match(regexTicket);
        if(parsedString) {
            // TODO: use an optmized regex
            const userPic = parsedString[1];
            const user = parsedString[2];
            const ticketActivity = parsedString[3];
            const cheevoId = parsedString[4]
            const cheevoName = parsedString[5]
            const gameName = parsedString[6];

            // announce ticket activity
            msg = new RichEmbed()
                .setTitle('Ticket ' + ticketActivity.toUpperCase() )
                .setURL(`${raorg}/ticketmanager.php?a=${cheevoId}`) // TODO: gonna change in v2
                .setColor( ticketActivity == "closed" ? 'BLUE' : 'RED' )
                .setThumbnail(`${raorg}/UserPic/${userPic}`)
                .setDescription(`**${user}** ${ticketActivity} a ticket for **${cheevoName}** in **${gameName}**.`)

            ticketsChannel.send(msg);
        }

    }
    lastActivity = new Date(newestTime);

    // The math below is a trick to get only one decimal number. Reference:
    // https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
    const timeIntervalMin = Math.round((newestTime.getTime() - oldestTime.getTime()) / 6000) / 10;

    const unixTime = Math.floor(oldestTime.getTime() / 1000);
    const userHistoryUrl = `${raorg}/historyexamine.php?d=${unixTime}&u=`;

    // announcing multiple unlocks
    userCheevoTimes.forEach( (value, user) => {
        if(value.length >= CHEEVO_WARNING_NUM) {

            // avoiding reporting the same user in a short period of time
            if(!counterMap.has(user)) {
                msg = new RichEmbed()
                    .setTitle(value.length >= CHEEVO_SUSPICIOUS_NUM ? 'IMPRESSIVE!!!' : 'wow!')
                    .setURL(`${userHistoryUrl}${user}`)
                    .setThumbnail(`${raorg}/UserPic/${user}.png`)
                    .setDescription(`**${user}** earned **${value.length}** achievements in less than ${timeIntervalMin} minutes\n**Game**: "${userCheevoGames.get(user).join('", "')}"`);

                unlocksChannel.send(msg);
                counterMap.set(user, 1);
            } else {
                counterMap.set(user, counterMap.get(user) + 1);

                // wait for 20 rss feeds before reporting the same user
                if(counterMap.get(user) > 20)
                    counterMap.delete(user);
            }

        }
    });
}

module.exports = (channels) => {
    masteryChannel = channels.get(CHANNEL_MASTERY);
    unlocksChannel = channels.get(CHANNEL_UNLOCKS);
    ticketsChannel = channels.get(CHANNEL_TICKETS);

    if( !masteryChannel || !unlocksChannel || !ticketsChannel ) {
        console.log('invalid channels')
    } else {
        setInterval( checkGlobalFeed, GLOBAL_FEED_INTERVAL * 1000 );
    }
}

