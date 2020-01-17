const Command = require("../../structures/Command");
const mathjs = require("mathjs");

module.exports = class CalculatorCommand extends Command {
    constructor(client) {
        super(client, {
            name: "calculator",
            aliases: ["calc"],
            group: "util",
            memberName: "calculator",
            description: "Evaluates the given math expression and responds with the result.",
            examples: ["`calculator 2 + 5`", "`calc 2.3 * 4.5`", "`calc sqrt(3^2 + 4^2)`", "`calc cos(45 deg)`" ],
            args: [
                {
                    key: "expression",
                    prompt: "What expression do you want to get the result?",
                    type: "string"
                }
            ]
        });
    }

    run(msg, { expression }) {
        try {
            return msg.say("`" + expression + "` = `" + mathjs.eval( expression ) + "`");
        } catch (err) {
            return msg.reply(`Oh no, an error occurred: \`${err.message}\`! :frowning:`);
        }
    }
};
