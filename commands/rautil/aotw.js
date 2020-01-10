const Command = require('../../structures/Command.js');
const fetch = require('node-fetch');
const {RA_USER, RA_WEB_API_KEY} = process.env;

module.exports = class AotwCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'aotw',
            group: 'rautil',
            memberName: 'aotw',
            description: 'Show the current Achievement of the Week and the recent winners.',
            examples: ['`aotw`, `aotw 2018-05-29`'],
            throttling: {
                usages: 2,
                duration: 120,
            },
            argsPromptLimit: 0,
            args: [
                {
                    key: 'date',
                    type: 'string',
                    prompt: '',
                    default: '0',
                    validate: date => {
                        const errMsg = '**Invalid date!**\n'
                        const myDate = new Date(date);

                        // is it a valid date?
                        if(myDate instanceof Date && !isNaN(myDate)) {
                            // future?
                            if(Date.now() - myDate > 0)
                                return true;
                            return `${errMsg}It must be something before now.`;
                        }
                        return `${errMsg}Try something like \`2018-06-27\`.`
                    }, // end of validate
                },
            ], // end of list of args
        });
    }

    async run(msg, {date}) {
        const max = 20;
        const sentMsg = await msg.reply(':hourglass: Getting AotW info, please wait...');
        const apiUrl = 'https://retroachievements.org/API/API_GetAchievementOfTheWeek.php?z=' + RA_USER + '&y=' + RA_WEB_API_KEY;
        fetch(apiUrl)
            .then(res => res.text())
            .then(res => {
                const data = JSON.parse(res);
                const achievement = data.Achievement;
                const winners = data.Unlocks;
                const aotwUrl = 'https://retroachievements.org/achievement/' + achievement.ID;
                let response = `:trophy: __**Achievement of the Week**__ :trophy:\n${aotwUrl}`;
                response += `\n\n**Recent Winners** (max ${max}):\n`
                response += '```md\n';
                for (let i = 1; i <= max && i < winners.length; i++) {
                    response += `\n[${winners[i].DateAwarded}]`;
                    response += `( ${winners[i].User} ) `;
                    response += winners[i].HardcoreMode === '1' ? '<hardcore> +1' : '+0.5'
                }
                response += '\n```\n';
                return sentMsg.edit(response)
            })
            .catch(error => {
                return sentMsg.delete()
            });
    }
};
