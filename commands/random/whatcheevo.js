const RandomGameCommand = require("../../structures/RandomGameCommand.js");
const fetch = require("node-fetch");

require("dotenv").config({path: __dirname + "../../.env"});
const { RA_USER, RA_TOKEN } = process.env;

const cheevoUrl = "https://retroachievements.org/achievement/";

module.exports = class WhatCheevoCommand extends RandomGameCommand {
    constructor(client) {
        super(client, {
            name: "whatcheevo",
            aliases: ["wa", "whatachievement", "whatach"],
            group: "random",
            memberName: "whatcheevo",
            description: "Responds with a random achievement.",
            examples: ["`whatcheevo`", "`wa nes`", "`whatachievement \"street fighter\"`", "`whatach megadrive`"],
            args: [
                {
                    key: "terms",
                    prompt: "",
                    type: "string",
                    //infinite: true, // there's a Commando bug with infinite+default
                    default: "~NOARGS~"
                },
            ]
        });
    }

    async run(msg, { terms }) {
        const sentMsg = await msg.reply(":hourglass: picking a random game, please wait...");
        let response = "Uh-oh! I think I faced a problem... :frowning:";
        let chosenGame = this.getRandomGame( terms );

        if( !chosenGame || ! chosenGame instanceof Array || chosenGame.length == 0 )
            return sentMsg.edit( "Didn't find anything... :frowning:" );

        sentMsg.edit(`:hourglass: picking a random achievement from "${chosenGame[1]}" set, please wait...`);

        fetch(`https://retroachievements.org/dorequest.php?r=patch&u=${RA_USER}&g=${chosenGame[0]}&f=3&h=1&t=${RA_TOKEN}`)
            .then(res => res.json())
            .then(json => {
                const cheevos = json.PatchData.Achievements;

                if( ! cheevos instanceof Array || cheevos.length == 0)
                    response = `I picked the game "${chosenGame[1]}", but looks like it has no achievements... :frowning:`;
                else
                    response = cheevoUrl + cheevos[ Math.floor( Math.random() * cheevos.length ) ].ID;

                return sentMsg.edit( response );
            })
            .catch(res => {
                return sentMsg.edit("Ouch! :frowning2:\nAn error occurred:```" + res + "```Please, contact a @mod.");
            });
    }

};

