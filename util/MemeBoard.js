// TODO: assure bot has permissions to manage messages in the meme-board channel
const { CHANNEL_MEME, ROLE_MOD } = process.env;
const { RichEmbed } = require('discord.js');

const minimumReactions = 5;
const maxMsgs = 100;

const modEmoji = '🚫';
const memoji = '🤖';
// regex: memoji followed by the number of votes followed '| message.id'
const memeRegex = /^\🤖\s([0-9]{1,3})\s\|\s([0-9]{17,20})/;

async function addMeme(reaction, user) {
    const message = reaction.message;

    // checking if a mod flagged this message
    let deleteMsg = false;
    if(reaction.emoji.name === modEmoji) {
        const member = await message.guild.fetchMember(user);
        if(member)
            deleteMsg = member.roles.has(ROLE_MOD);
    }
    else if(!isValidReaction(reaction, user))
        return;

    const memeChannel = message.guild.channels.get(CHANNEL_MEME);

    if (!memeChannel)
        return message.channel.send(`It appears that you do not have a meme-board channel.`); 

    // fetch maxMsgs messages from the memeboard channel.
    const fetch = await memeChannel.fetchMessages({ limit: maxMsgs }); 

    // check the messages within the fetch object to see if the message
    // that was reacted to is already in the meme-board
    const memes = fetch.find(m => m.embeds[0].footer.text.startsWith(memoji) && m.embeds[0].footer.text.endsWith(message.id)); 

    // if the message is found within the memeboard.
    if (memes) {
        // fetch the ID of the message already on the memeboard.
        const memeMsg = await memeChannel.fetchMessage(memes.id);

        if(deleteMsg)
            return memeMsg.delete(1000);

        const memeCounter = memeRegex.exec(memes.embeds[0].footer.text);

        // A variable that allows us to use the color of the pre-existing embed.
        const foundMeme = memes.embeds[0];

        // the extension function checks if there is anything attached to the message.
        const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : ''; 

        const embed = new RichEmbed()
            .setColor(foundMeme.color)
            .setTitle(foundMeme.title)
            .setAuthor(message.author.tag, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(`[link](${message.url})`)
            .setFooter(`${memoji} ${parseInt(memeCounter[1])+1} | ${message.id}`)
            .setImage(image);

        // edit the message with the new embed
        return await memeMsg.edit({ embed }); 
    }

    // if the message is not on the memeboard yet
    if (!memes && !deleteMsg) {
        // checking if a mod flagged this message
        let msgReaction = await message.reactions.find(r => r.emoji.name === modEmoji);
        if(msgReaction) {
            for(let u of msgReaction.users.values()) {
                const member = await message.guild.fetchMember(user);
                if(member && member.roles.has(ROLE_MOD))
                    return;
            }
        }

        // message only goes to the meme-board after 5 memoji reactions by non-bot users
        let reactionCounter = 0;
        msgReaction = await message.reactions.find(r => r.emoji.name === memoji);
        for(let u of msgReaction.users.values())
            if(!u.bot) ++reactionCounter;

        if(reactionCounter < minimumReactions)
            return;

        const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : ''; 

        // If the message is empty, we don't allow the user to meme the message.
        if (image === '' && message.cleanContent.length < 1)
            return message.channel.send(`${user}, you cannot meme an empty message.`); 

        const embed = new RichEmbed()
            // nice yellow
            .setColor(15844367)
            // Here we use cleanContent, which replaces all mentions in the message with their
            // equivalent text. For example, an @everyone ping will just display as @everyone, without tagging you!
            // At the date of this edit (31/Jan/19) embeds do not mention yet.
            // But nothing is stopping Discord from enabling mentions from embeds in a future update.
            .setTitle(message.cleanContent) 
            .setAuthor(message.author.tag, message.author.displayAvatarURL)
            .setTimestamp(new Date())
            .setDescription(`[link](${message.url})`)
            .setFooter(`${memoji} ${reactionCounter} | ${message.id}`)
            .setImage(image);

        await memeChannel.send({ embed });
    }
}

async function removeMeme(reaction, user) {
    if(!isValidReaction(reaction, user))
        return;

    const message = reaction.message;
    const memeChannel = message.guild.channels.get(CHANNEL_MEME);

    if (!memeChannel)
        return message.channel.send(`It appears that you do not have a meme-board channel.`); 

    const fetchedMessages = await memeChannel.fetchMessages({ limit: maxMsgs });
    const memes = fetchedMessages.find(m => m.embeds[0].footer.text.startsWith(memoji) && m.embeds[0].footer.text.endsWith(reaction.message.id));
    if (memes) {
        const memeCounter = memeRegex.exec(memes.embeds[0].footer.text);
        const foundMeme = memes.embeds[0];
        const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : '';
        const embed = new RichEmbed()
            .setColor(foundMeme.color)
            .setTitle(foundMeme.title)
            .setDescription(`[link](${message.url})`)
            .setAuthor(message.author.tag, message.author.displayAvatarURL)
            .setTimestamp()
            .setFooter(`${memoji} ${parseInt(memeCounter[1])-1} | ${message.id}`)
            .setImage(image);

        const memeMsg = await memeChannel.fetchMessage(memes.id);
        await memeMsg.edit({ embed });

        if(parseInt(memeCounter[1]) - 1 == 0) return memeMsg.delete(1000);
    }
}

function isValidReaction(reaction, user) {
    const message = reaction.message;
    return reaction.emoji.name === memoji   // reaction is the memoji
        && message.author.id !== user.id    // reaction not sent by the author
        && !user.bot                        // reaction not sent by a bot
        && !message.author.bot;             // author is not a bot
}


// Here we add the extension function to check if there's anything attached to the message.
function extension(reaction, attachment) {
    const imageLink = attachment.split('.');
    const typeOfImage = imageLink[imageLink.length - 1];
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
    if (!image) return '';
    return attachment;
}

module.exports.addMeme = addMeme;
module.exports.removeMeme = removeMeme;
