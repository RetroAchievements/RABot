const Command = require('./Command.js');
const { gamelist, consoles } = require('../util/GetGameList.js');

module.exports = class RandomGameCommand extends Command {
    constructor(client, info) {
        super(client, info);
    }


    pickGame( games ) {
        if( ! games instanceof Array || games.length == 0)
            return undefined;

        return games[ Math.floor( Math.random() * games.length ) ];
    }


    getRandomGame( terms ) {
        // picking a random game globally
        if( terms == '~NOARGS~' )
            return this.pickGame( gamelist.games );

        let games;
        let term = terms.toLowerCase();
        let offset;
        let length;

        // if the search term is a console name, pick a random game from that console
        if( consoles.includes( term ) ) {
            const index = gamelist.index;
            const consoleName = term;
            offset = index[ consoleName ][0];
            length = index[ consoleName ][1];
            games = gamelist.games.slice( offset, offset + length );
            return this.pickGame( games );
        }

        let regex;
        try {
            regex = new RegExp( term, 'i' );
        } catch( err ) {
            return `invalid Regular Expression: \`${term}\``;
        }
        games = gamelist.games;
        games = games.filter( entry => entry[1].match( regex ) );

        return this.pickGame( games );
    }

};

