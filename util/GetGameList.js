const { execFile } = require('child_process');

const getGLScript = `${__dirname}/getgamelist.sh`;

const glPath = `${__dirname}/../assets/json`;

let gamelist = {
    index: {},
    games: []
};

const consoles = {
    1: "megadrive",
    2: "n64",
    3: "snes",
    4: "gb",
    5: "gba",
    6: "gbc",
    7: "nes",
    8: "pcengine",
    //9: "segacd",
    //10: "sega32x",
    11: "mastersystem",
    //12: "psx",
    13: "atarilynx",
    14: "ngp",
    15: "gamegear",
    //16: "gamecube",
    //17: "jaguar",
    //18: "nds",
    //19: "wii",
    //20: "wiiu",
    //21: "ps2",
    //22: "xbox",
    //23: "skynet",
    //24: "xone",
    25: "atari2600",
    //26: "dos",
    27: "arcade",
    28: "virtualboy",
    //29: "msx",
    //30: "commodore64",
    //31: "zx81",
    51: "atari7800",
};

const consoleAliases = {
    md: consoles['1'],
    megadrive: consoles['1'],
    genesis: consoles['1'],

    n64: consoles['2'],

    snes: consoles['3'],

    gb: consoles['4'],
    gameboy: consoles['4'],

    gba: consoles['5'],
    gameboyadvance: consoles['5'],

    gbc: consoles['6'],
    gameboycolor: consoles['6'],

    nes: consoles['7'],

    pcengine: consoles['8'],
    tg16: consoles['8'],
    turbografx: consoles['8'],
    supergrafx: consoles['8'],

    mastersystem: consoles['11'],
    sms: consoles['11'],

    atarilynx: consoles['13'],
    lynx: consoles['13'],

    ngp: consoles['14'],
    ngpc: consoles['14'],
    neogeopocket: consoles['14'],
    neogeopocketcolor: consoles['14'],

    gamegear: consoles['15'],
    gg: consoles['15'],

    atari2600: consoles['25'],
    atari: consoles['25'],
    vcs: consoles['25'],

    arcade: consoles['27'],

    virtualboy: consoles['28'],
    vb: consoles['28'],

    atari7800: consoles['51']
};


function loadGameLists() {
    let consoleIDs = Object.keys( consoles );
    let consoleID;
    let json;
    let entries;
    let tmpIndex = 0;

    for( let i = 0; i < consoleIDs.length; i++ ) {
        consoleID = consoleIDs[i];
        json = require(`${glPath}/gl-${consoles[ consoleID ]}.json`);
        if( json.Success ) {
            entries = Object.entries( json.Response );

            gamelist.games = gamelist.games.concat( entries );
            gamelist.index[ consoles [ consoleID ] ] = [
                tmpIndex,
                entries.length
            ];
            tmpIndex += entries.length;
        }
    }
}


function getAllGameLists() {
    const script = execFile( 'bash', [getGLScript], (err, stdout, stderr) => {
        if(err) {
            console.error(err);
            return 1;
        }
        console.log(stdout);
        loadGameLists();
    });
}

function getGameList() {
    loadGameLists();

    // update twice a day
    setInterval( getAllGameLists, 1000 * 60 * 60 * 12 );
}

module.exports.gamelist = gamelist;
module.exports.consoleAliases = consoleAliases;
module.exports.getGameList = getGameList;



/*

// This is a failed attempt to get the list of games with pure JavaScript+Node
// I hate asynchronouse programming! >:(

async function getGameListByConsole( consoleID ) {
    const res  = await fetch( encodeURI( gamelistURL + consoleID ) );
    const json = await res.json();

    if( json.Success ) {
        // loading the file into the memory again
        const tmpJson = gamelists[ consoles[ consoleID ] ] = Object.entries( json.Response );
        globalGamelist = Object.assign( tmpJson, globalGamelist );

        // writing the current file
        fs.writeFile( `${glPath}/gl-${consoles[consoleID]}.json`, JSON.stringify(tmpJson, null, 1), (err) => {
            if( err ) {
                console.error(err);
                return;
            }
            console.log(`[LOG] successfully updated gamelist for console ID ${consoleID}`);
        });
    } else {
		console.warn(`[WARNING] failed to get gamelist for console ID ${consoleID}`);
	}
}


function getAllGameLists() {
    Object.keys( consoles ).forEach( consoleID => getGameListByConsole( consoleID ) );
}
*/

