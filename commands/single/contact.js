const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');

module.exports = class ContactCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'contact',
      aliases: ['contactus', 'contact-us'],
      group: 'single',
      memberName: 'contact',
      description: 'How to contact the RetroAchievements staff.',
    });
  }

  async run(msg) {
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Contact Us')
      .setDescription('If you would like to contact us, please send a site message to the appropriate team below.')
      .addField(':e_mail: Admins and Moderators',
        `[Send a message to RAdmin](https://retroachievements.org/createmessage.php?t=RAdmin)
                 - Reporting offensive behavior.
                 - Reporting copyrighted material.
                 - Requesting to be untracked.`)
      .addField(':e_mail: Developer Compliance',
        `[Send a message to Developer Compliance](https://retroachievements.org/createmessage.php?t=DevCompliance)
                 - Requesting set approval or early set release.
                 - Reporting achievements or sets with unwelcome concepts.
                 - Reporting sets failing to cover basic progression.`)
      .addField(':e_mail: Quality Assurance',
        `[Send a message to Quality Assurance](https://retroachievements.org/createmessage.php?t=QATeam)
                 - Reporting a broken set, leaderboard, or rich presence.
                 - Reporting achievements with grammatical mistakes.
                 - Requesting a set be playtested.
                 - Hash compatibility questions.
                 - Hub organizational questions.
                 - Getting involved in a QA sub-team.`)
      .addField(':e_mail: RAArtTeam',
        `[Send a message to RAArtTeam](https://retroachievements.org/messages/create?to=RAArtTeam)
                 - Icon Gauntlets and how to start one.
                 - Proposing art updates.
                 - Questions about art-related rule changes.
                 - Requests for help with creating a new badge or badge set.`)
      .addField(':e_mail: WritingTeam',
        `[Send a message to WritingTeam](https://retroachievements.org/messages/create?to=WritingTeam)
                 - Reporting achievements with grammatical mistakes.
                 - Reporting achievements with unclear or confusing descriptions.
                 - Requesting help from the team with proofreading achievement sets.
                 - Requesting help for coming up with original titles for achievements.`)
      .addField(':e_mail: RANews',
        `[Send a message to RANews](https://retroachievements.org/createmessage.php?t=RANews)
                 - Submitting a Play This Set, Wish This Set, or RAdvantage entry.
                 - Submitting a retrogaming article.
                 - Proposing a new article idea.
                 - Getting involved with RANews.`)
      .addField(':e_mail: RAEvents',
        `[Send a message to RAEvents](https://retroachievements.org/createmessage.php?t=RAEvents)
                 - Submissions, questions, ideas, or reporting issues related to events.`)
      .addField(':e_mail: DevQuest',
        `[Send a message to DevQuest](https://retroachievements.org/createmessage.php?t=DevQuest)
                 - Submissions, questions, ideas, or reporting issues related to DevQuest.`)
      .addField(':e_mail: RACheats',
        `[Send a message to RACheats](https://retroachievements.org/createmessage.php?t=RACheats)
                 - If you believe someone is in violation of our [Global Leaderboard and Achievement Hunting Rules](https://docs.retroachievements.org/guidelines/users/global-leaderboard-and-achievement-hunting-rules.html#not-allowed).`);
    try {
      await msg.react('📧');
      return msg.reply(embed);
    } catch (err) {
      return msg.reply(embed);
    }
  }
};
