const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

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
    const embed = new RichEmbed()
      .setColor('#0099ff')
      .setTitle('Contact Us')
      .setDescription('If you would like to contact us, please send a site message to the appropriate team below.')
      .addField(`:e_mail: Admins and Moderators`,
                `[Send a message to RAdmin](https://retroachievements.org/createmessage.php?t=RAdmin)
                 - Report offensive behavior.
                 - Report copyrighted material.
                 - Report cheating to be investigated.
                 - Any User Code of Conduct related issues.`)
      .addField(`:e_mail: Developer Compliance`,
                `[Send a message to Developer Compliance](https://retroachievements.org/createmessage.php?t=DevCompliance)
                 - Request set approval or early set release.
                 - Report achievements or sets with unwelcome concepts.
                 - Report sets failing to cover basic progression.
                 - Any Developer Code of Conduct related issues.`)
      .addField(`:e_mail: Quality Assurance`,
                `[Send a message to Quality Assurance](https://retroachievements.org/createmessage.php?t=QATeam)
                 - Report a broken set, leaderboard, or Rich Presence.
                 - Report achievements with grammar mistakes.
                 - Request a set playtest or hash compatibility test.
                 - Hash or Hub organization questions.
                 - Get involved in a QA sub-team.`)
      .addField(`:e_mail: RANews`,
                `[Send a message to RANews](https://retroachievements.org/createmessage.php?t=RANews)
                 - Submit a Play This Set, Wish This Set, or RAdvantage entry.
                 - Submit a retrogaming article.
                 - Propose a new article idea.
                 - Get involved with RANews.`)
      .addField(`:e_mail: RAEvents`,
                `[Send a message to RAEvents](https://retroachievements.org/createmessage.php?t=RAEvents)
                 - Submissions, questions, ideas, or reporting issues related to events.`)
      .addField(`:e_mail: DevQuest`,
                `[Send a message to DevQuest](https://retroachievements.org/createmessage.php?t=DevQuest)
                 - Submissions, questions, ideas, or reporting issues related to DevQuest.`)
      .addField(`:e_mail: QualityQuest`,
                `[Send a message to QualityQuest](https://retroachievements.org/createmessage.php?t=QualityQuest)
                 - Submissions, questions, ideas, or reporting issues related to QualityQuest.`)
    try {
      await msg.react('📧');
      return msg.reply(embed);
    } catch (err) {
      return msg.reply(embed);
    }
  }
};

