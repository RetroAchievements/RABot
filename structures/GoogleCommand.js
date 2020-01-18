const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Command = require('./Command.js');

class GoogleCommand extends Command {
    constructor(client, info, site, regex) {
        super(client, info);

        this.site = site;
        this.regex = regex;
        this.throttling = info.throttling || { usages: 5, duration: 60 };
    }

    async run(msg, { terms }) {
        let searchURL = `https://www.google.com/search?q=site:${this.site}`;
        let response;

        terms.forEach((term) => searchURL += `+${term}`);

        const sentMsg = await msg.reply(':mag: Googling, please wait...');

        fetch(encodeURI(searchURL))
            .then((res) => res.text())
            .then((body) => {
                const $ = cheerio.load(body);
                response = $('h3.r').toString().match(this.regex);
                response = response ? `https://${unescape(response)}` : "Didn't find anything... :frowning:";
                return sentMsg.edit(`${msg.author}, ${response}`);
            })
            .catch((res) => {
                sentMsg.edit(`${msg.author}, **error**: Something went wrong...`);
                console.error(res);
            });
    }
}

module.exports = GoogleCommand;
