const Command = require('../../structures/Command');

const { CHANNEL_BOTGAMES, CHANNEL_BOTSPAM } = process.env;


module.exports = class PruneCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setrole',
      aliases: ['setrole'],
      group: 'mod',
      memberName: 'setrole',
      description: 'Gives specific role to designated user.',
      examples:[`'!setrole @role @user'`],
      guildOnly: true,
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['MANAGE_ROLES'],
      args: [
        {
            key: 'role',
            label: 'role',
            prompt: 'What role would you like to give?',
            type: 'role'
        },
        {
          key: 'user',
          label: 'user',
          prompt: 'What user would you like the role to be given?',
          type: 'user'
      }
      ],
    });
  }

  async run(msg, { role, user }) {
    
    const allowedMember = msg.guild.members.get(user.id).permissions.has('MANAGE_ROLES');
    if(allowedMember){
      const guild = msg.guild;
      const guildRole = guild.roles.find(r => r.name == role.name);
      const guildMember = guild.members.find(u => u.id == user.id);
      if(guildMember.roles.has(guildRole.id)){
        return msg.reply(`User ${guildMember.displayName} already has that role.`);
      }
      if(guildMember && guildRole){
        await guildMember.addRole(guildRole);
        msg.reply(`I have granted ${guildMember.displayName} the role of ${role.name}`);
      }

    }
    
  }
};
