const Command = require('../../structures/Command.js');
const fetch = require('node-fetch');

module.exports = class User extends Command {
    constructor(client) {
        super(client, {
            name: 'user',
            group: 'rautil',
            memberName: 'user',
            description: 'Show the current user stats.',
            examples: ['`!user username`'],
            throttling: {
                usages: 2,
                duration: 120,
            },
            argsPromptLimit: 0,
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'What user would you like to fetch?',
                    parse: username => {
                        return username.toLowerCase();
                    },
                },
            ],
        });
    }

    async run(msg, { username }) {
        const u = process.env.USER;
        const k = process.env.KEY;
        const baseUrl = 'https://retroachievements.org/';
        const url = `${baseUrl}API/API_GetUserSummary.php?z=${u}&y=${k}&u=${username}`;
        await msg.reply(`:hourglass: Getting ${username} info, please wait...`);

        fetch(url)
            .then(res => res.json())
            .then(res => {
                if(res.ID == null){ 
                  return msg.reply(`Couldn't find any user called ${username} on site. Please try again.`);
                }
                return msg.embed({
                    color: 3447003,
                    author: {
                      name: username,
                      icon_url: `${baseUrl}${res.UserPic}`
                    },
                    title: `Profile stats for ${username}[${res.Permissions ? 'verified':'not verified'}] `,
                    url: `${baseUrl}user/${username}`,
                    description: `:notepad_spiral: Users motto is '*${res.Motto}*'.`,
                    fields: [
                        {
                          name:`${res.Status == 'Offline' ? ':red_circle:':':green_circle:'} Current status`,
                          value:`User is **${res.Status}**.`
                        },
                        {
                          name:`:watch: User registration on platform`,
                          value:`**${res.MemberSince}**`
                        },
                        {
                          name:':trophy: Rank / Points',
                          value:`User is **${res.Rank}** rank and has **${res.Points}** points`
                        },
                        {
                            name: ":video_game: Last game played",
                            value: `Name: **${res.RecentlyPlayed[0].Title}**\n
                            Console: **${res.RecentlyPlayed[0].ConsoleName}**\n
                            Date/Time: **${res.RecentlyPlayed[0].LastPlayed}**'`
                          },
                    ],
                    timestamp: new Date(),
                    footer: {
                      text: 'More on https://retroacheivements.org'
                    },
                    // in case there is a attachment needed uncomment the below line
                    // file:``
                  })
            })
        .catch(err => {
            return msg.reply('Ouch! :frowning2:\nAn error occurred:```' + err + '```Please, contact a @mod.');
        });
    }

};
