const Command = require('../../structures/Command');

const rules = require('../../assets/answers/rules.js');


module.exports = class RulesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rules',
            aliases: ['rule'],
            group: 'helper',
            memberName: 'rules',
            description: 'Show the rules (or a specific one).',
            argsPromptLimit: 0,
            args: [
                {   
                    key: 'arg',
                    prompt: '',
                    type: 'string',
                    default: 'all',
                },
            ],
        });
    }

    run(msg, { arg }) {
        let response = rules[arg];

        if(!response)
            response = `**invalid rule**: ${arg}\n\n${rules['all']}`;

        return msg.say(response);
    }
};
