const logger = require('pino')({
  useLevelLabels: true,
  timestamp: () => `,"time":"${new Date()}"`,
});

const { ROLE_MOD, AOTW_ROLE_ID } = process.env;
const Command = require('../../structures/Command.js');

module.exports = class SetAOTWCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setaotw',
      group: 'mod',
      memberName: 'setaotw',
      aliases: ['giveaotw', 'aotwaward'],
      description: 'Offers AOTW Winner role to designated user.',
      examples:['!setaotw @user'],
      args: [
        {
          key: 'username',
          prompt: 'Who would you like to give the role to?',
          type: 'user',
        },
      ],
    });
  }

  async run(msg, { username }) {
    // check if the requested user to be given role exists
    const user = await msg.guild.fetchMember(username);

    // check if AOTW WINNER role exists on the channel
    const aotwRole = await msg.guild.roles.get(AOTW_ROLE_ID);
    // check if requesting user is mod user
    const isMod = await msg.member.roles.has(ROLE_MOD);
    const hasAOTW = await user.roles.has(AOTW_ROLE_ID);
    // if the user already has the role, do nothing
    if (hasAOTW) {
      return;
    }
    // if all checks pass give the role to the user
    if (user && isMod && aotwRole) {
      // award the user the role
      await user.addRole(aotwRole).catch(logger.error);
      logger.info({ msg: `@Mod ${msg.member.displayName} added ${aotwRole.name} to ${user.displayName}` });
      msg.say(`:trophy: Congratulations **${user.displayName}**. You have been awarded **${aotwRole.name}** role!`);
    }
  }
};
