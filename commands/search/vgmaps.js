const url = 'https://www.vgmaps.com/Atlas/';

const vgmapsConsole = {
    megadrive: 'Genesis',
    mastersystem: 'MasterSystem',
    gamegear: 'GameGear',

    nes: 'NES',
    snes: 'SuperNES',
    gb: 'GB-GBC',
    gbc: 'GB-GBC',
    gba: 'GBA',
    n64: 'N64',
    vb: 'VirtualBoy',

    pcengine: 'TG16',

    ngp: 'NGP-NGPC',
    ngpc: 'NGP-NGPC',

    atari2600: 'Atari2600',
    atari7800: 'Atari7800',
//    lynx:

    arcade: 'Arcade'
};



async run( msg, { system, game } ) {
    const sentMsg = msg.reply(':hourglass: Getting info, please wait...');

    try {
        const res = await fetch(url + system);
        const $ = cheerio.load( await res.text() );

        const searchTerm = game.replace(/[][}{|\\^~` <>"#%&]/g, '');

        const games = $("table")
            .find(`a[name*='${searchTerm}' i]`)
            .map( (i, elem) => $(elem).attr("name") )
            .get();

        if( games.length < 1 )
            return sentMsg.edit("Didn't find anything... :frowning:");

        let choice = 0;
        if( games.length > 1 ) {
            choice = whichOption( games );
            if( choice < 0 ) {
                if( choice == -2 )
                    return msg.reply(`**Try to give a more specific game name}>**`);
                return;
            }
        }

        const gameAnchor = games[choice];
        const gameMapsUrl = url + system + '/index.htm#' + gameAnchor;

        const maps = $("table")
            .find(`[name='${gameAnchor}']`)
            .parents("table")
            .find("a")
            .map( (i, elem) => {
                const href = $(elem).attr("href");
                if(!href)
                    return;
                if( href.endsWith(".png") || href.endsWith(".jpg") )
                    return href;
            })
            .get();

        if( games.length < 1 )
            return sentMsg.edit(`Didn't find any map for ${games[choice]}... :frowning:`);

        choice = 0;
        if( maps.length > 1 ) {
            choice = whichOption( maps );
            if( choice < 0 ) {
                if( choice == -2 )
                    return msg.reply(`**Try checking here**: <${gameMapsUrl}>`);
                return;
            }
        }

        const map = maps[choice];

        return msg.reply(`**Map:** ${url + system + '/' + map}\n**Check here for more maps**: <${gameMapsUrl}>`);

    } catch(err) {
        sentMsg.edit(err.message);
    }
}


/*
 * returns a negative number if choice is invalid.
 * -1 means "time is up!"
 * -2 means "too many options"
 */
async whichOption( msg, array ) {
    let options = '';

    for( let i = 0; i < array.length; i++ )
        options += `\n__**${i+1}**__. ${array[i]}`;

    if( options.length > 1900 ) {
        await msg.say("Ouch! I'm afraid I can't handle this! :sweat:");
        return -2;
    }

    msg.say(`${options}\n**Which option do you choose?**`);

    const filter = res => {
        const choice = parseInt(res.content);
        return res.author.id === msg.author.id &&
            !isNaN(choice) &&
            choice >= 0 &&
            choice < array.length + 1;
    };

    const msgs = await msg.channel.awaitMessages(filter, {
        max: 1,
        time: 30000
    });

    if(!msgs.size) {
        await msg.say('Sorry, time is up!');
        return -1;
    }

    // since it passed the 'filter', it's supposed to be a positive number
    return parseInt(msgs.first().content) - 1;
}
