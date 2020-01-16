const Command = require('../../structures/Command.js');
const { RichEmbed } = require('discord.js');
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
                duration: 60,
            },
            argsPromptLimit: 0,
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'What user would you like to fetch?',
                    default: '',
                    parse: username => {
                        return username.toLowerCase();
                    },
                },
            ],
        });
    }

    async run(msg, { username }) {
        const u = process.env.RA_USER;
        const k = process.env.RA_WEB_API_KEY;
        const baseUrl = 'https://retroachievements.org/';

        if(username === '') {
            username = msg.member.nickname || msg.author.username
        }

        const url = `${baseUrl}API/API_GetUserSummary.php?z=${u}&y=${k}&u=${username}`;
        const sentMsg = await msg.reply(`:hourglass: Getting ${username} info, please wait...`);

        // permissions magic numbers
        // https://github.com/RetroAchievements/RAWeb/blob/develop/src/Permissions.php
        const permissions = {
            '-2': 'Spam',
            '-1': 'Banned',
            '0': 'Unregistered',
            '1': 'Registered',
            '2': 'SuperUser',
            '3': 'Developer',
            '4': 'Admin',
            '5': 'Root'
        }

        fetch(url)
            .then(res => res.json())
            .then(res => {
                if(res.ID == null){ 
                  return sentMsg.edit(`Couldn't find any user called **${username}** on site.`);
                }

                const embedFields = [
                    {
                      name:`:bust_in_silhouette: Member since`,
                      value:`**${res.MemberSince}**`
                    },
                    {
                      name:':trophy: Rank | Points',
                      value:`Rank **${res.Rank}** | **${res.Points}** points`
                    },
                    {
                        name: `:video_game: Last game played (${res.RecentlyPlayed[0] ? res.RecentlyPlayed[0].LastPlayed : ''})`,
                        value: `**${res.RecentlyPlayed[0] ? res.RecentlyPlayed[0].Title : ''} (${res.RecentlyPlayed[0] ? res.RecentlyPlayed[0].ConsoleName : ''})**`
                    },
                    {
                        name: `:clock4: Last seen in`,
                        value: `**${res.RichPresenceMsg}**`
                    },
                ];

                if (res.Motto) {
                    embedFields.unshift({
                        name: ':speech_balloon: Motto',
                        value: `**${res.Motto}**`
                    });
                }

                const richEmbed = new RichEmbed({
                    color: 3447003,
                    author: {
                      name: username,
                      icon_url: `${baseUrl}${res.UserPic}`
                    },
                    title: `Role: ${permissions[res.Permissions]}`,
                    url: `${baseUrl}user/${username}`,
                    fields: embedFields,
                    /*
                    footer: {
                      text: 'More on https://retroachievements.org'
                    },
                    */
                    // in case there is a attachment needed uncomment the below line
                    // file:``
                });

                return sentMsg.edit(richEmbed);
            })
        .catch(err => {
            return sentMsg.edit('Ouch! :frowning2:\nAn error occurred:```' + err + '```Please, contact a @mod.');
        });
    }

};
