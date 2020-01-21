const logger = require('pino')({
  useLevelLabels: true,
  timestamp: () => `,"time":"${new Date()}"`,
});

const { ROLE_MOD_NAME, AOTW_ROLE_ID } = process.env;
const Command = require('../../structures/Command.js');

module.exports = class SayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'removeaotw',
      group: 'mod',
      memberName: 'removeaotw',
      aliases: ['aotwremove'],
      description: 'Removes the AOTW Winner role from designated user.',
      args: [
        {
          key: 'username',
          prompt: 'Who would you like to have the role removed from?',
          type: 'user',
        },
      ],
    });
  }

  async run(msg, { username }) {
    // check if the requested user to be given role exists
    const user = await msg.guild.fetchMember(username);

    const hasAOTW = await user.roles.has(AOTW_ROLE_ID);
    // if the the user has the role, if not do nothing
    if (!hasAOTW) {
      return;
    }
    // check if AOTW WINNER role exists on the channel
    const aotwRole = await msg.guild.roles.get(AOTW_ROLE_ID);
    // check if requesting user is mod user
    const isMod = await msg.member.roles.find((role) => role.name === ROLE_MOD_NAME);

    // if all checks pass give the role to the user
    if (user && isMod && aotwRole) {
      // remove role from the user
      await user.removeRole(aotwRole).catch(logger.error);
      logger.info({ msg: `@Mod ${msg.member.displayName} removed ${aotwRole.name} from ${user.displayName}` });
      msg.say(`**${aotwRole.name}** has been removed from user **${user.displayName}**.`);
    }
  }
};
