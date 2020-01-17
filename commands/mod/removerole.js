const Command = require('../../structures/Command');

const { CHANNEL_BOTGAMES, CHANNEL_BOTSPAM } = process.env;


module.exports = class PruneCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'removerole',
      aliases: ['removerole'],
      group: 'mod',
      memberName: 'removerole',
      description: 'Gives specific role to designated user.',
      examples: ['\'!removerole @role @user\''],
      guildOnly: true,
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: 'role',
          label: 'role',
          prompt: 'What role would you like to remove?',
          type: 'role',
        },
        {
          key: 'user',
          label: 'user',
          prompt: 'What user would you like the remove the role from?',
          type: 'user',
        },
      ],
    });
  }

  async run(msg, { role, user }) {
    
    const HIGER_ORDER_ROLES=['mod','staff','patron','admin'];

    const allowedMember = msg.guild.members.get(user.id).permissions.has('MANAGE_ROLES');

    // just a double check to besure that not all mods can be removed
    if (allowedMember && !HIGER_ORDER_ROLES.includes(role.name)) {
      const { guild } = msg;
      const guildRole = guild.roles.find((r) => r.name == role.name);
      const guildMember = guild.members.find((u) => u.id == user.id);
      if (!guildMember.roles.has(guildRole.id)) {
        return msg.reply(`User ${guildMember.displayName} does not have that role.`);
      }
      if (guildMember && guildRole) {
        await guildMember.removeRole(guildRole);
        msg.reply(`I have removed the role of ${role.name} from ${guildMember.displayName}.`);
      }
    }
  }
};
