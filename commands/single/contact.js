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
    const response =
      "\n:e_mail: **Admins and Moderators**\n"
      + "<https://retroachievements.org/createmessage.php?t=RAdmin>\n"
      + "If you want to report things like:\n"
      + "- offensive posts\n"
      + "- copyrighted material sharing\n"
      + "- cheating\n"
      + "- or any breach of the Code of Conduct\n"
      + "\n:e_mail: **RANews Team**\n"
      + "<https://retroachievements.org/createmessage.php?t=RANews>\n"
      + "If you want to:\n"
      + "- write a play-this-set\n"
      + "- submit a retrogaming article (anything)\n"
      + "- help with the mag but don't know how\n"
      + "\n:e_mail: **QA Team**\n"
      + "<https://retroachievements.org/createmessage.php?t=QATeam>\n"
      + "If you want to talk about:\n"
      + "- unwelcome concepts\n"
      + "- claim questions\n"
      + "- DevQuest ideas\n"
      + "- get involved in a QA sub-team\n"
      + "- or any other Dev Code of Conduct related issue"

    try {
      await msg.react('📧');
      return msg.reply(response);
    } catch (err) {
      return msg.reply(response);
    }
  }
};

