const ConvertCommand = require("../../structures/ConvertCommand.js");

module.exports = class HexCommand extends ConvertCommand {
    constructor(client) {
        super(client, {
            name: "hex",
            group: "rautil",
            memberName: "hex",
            description: "Converts a non-negative integer from decimal (or binary) to hexadecimal (or vice-versa).",
            examples: ["`hex 16`, `hex 0xaf 0x10`, `hex 0b1010`"],
            argsPromptLimit: 0,
            args: [
                {
                    key: "numbers",
                    type: "string",
                    infinite: true,
                    prompt: "",
                },
            ],
        }, 16); // <-- that means hexadecimal (base 16)
    }
};
