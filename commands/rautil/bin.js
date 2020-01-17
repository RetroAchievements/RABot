const ConvertCommand = require("../../structures/ConvertCommand.js");

module.exports = class BinCommand extends ConvertCommand {
    constructor(client) {
        super(client, {
            name: "bin",
            group: "rautil",
            memberName: "bin",
            description: "Converts a non-negative integer from decimal (or hexadecimal) to binary (or vice-versa).",
            examples: ["`bin 16`, `bin 0xaf 0x10`, `bin 0b1010`"],
            argsPromptLimit: 0,
            args: [
                {
                    key: "numbers",
                    type: "string",
                    infinite: true,
                    prompt: "",
                },
            ],
        }, 2); // <-- that means binary (base 2)
    }
};
