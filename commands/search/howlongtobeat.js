const GoogleCommand = require("../../structures/GoogleCommand.js");

const site = "howlongtobeat.com";
const regex = /howlongtobeat\.com\/game\.php%3Fid%3D[0-9]+/;


module.exports = class HowLongToBeatCommand extends GoogleCommand {
    constructor(client) {
        super(client, {
            name: "howlongtobeat",
            aliases: ["hltb"],
            group: "search",
            memberName: "howlongtobeat",
            description: "Google for a game at howlongtobeat.com and show the link.",
            examples: ["`howlongtobeat super mario world`", "`hltb ninja five o`" ],
            args: [
                {
                    key: "terms",
                    prompt: "",
                    type: "string",
                    infinite: true,
                    default: "1",
                },
            ]
        }, site, regex);
    }

};

