const Command = require('./Command.js');

class SelfRoleCommand extends Command {
  constructor(client, info, roleid) {
    super(client, info);

    this.guildOnly = true;
    this.throttling = info.throttling || { usages: 4, duration: 3600 };

    this.roleid = roleid;
  }

  async run(msg, { action }) {
    const roleName = `\`@${msg.guild.roles.get(this.roleid).name}\``;

    switch (action.toLowerCase()) {
      case 'add':
        if (msg.member.roles.has(this.roleid)) {
          msg.reply(`you already have the ${roleName} role.`);
        } else {
          msg.member.addRole(this.roleid).catch(console.error);
          msg.reply(`the ${roleName} role has been added to you`);
        }
        break;

      case 'remove':
        if (msg.member.roles.has(this.roleid)) {
          msg.member.removeRole(this.roleid).catch(console.error);
          msg.reply(`the ${roleName} role has been removed from you`);
        } else {
          msg.reply(`you don't have the ${roleName} role.`);
        }
        break;

      case 'show':
        if (msg.member.roles.has(this.roleid)) msg.reply(`you have the ${roleName} role.`);
        else msg.reply(`you do not have the ${roleName} role.`);
        break;

      default:
        msg.reply(`invalid option: \`${action}\``);
    }
  }
}

module.exports = SelfRoleCommand;
