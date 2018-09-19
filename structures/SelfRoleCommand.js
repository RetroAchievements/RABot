const Command = require('./Command.js');

class SelfRoleCommand extends Command {
    constructor(client, info, roleid) {
        super(client, info);
        
        this.roleid = roleid;
        this.throttling = info.throttling || { usages: 4, duration: 3600 };
    }

    async run(msg, { action } ) {
        let roleName = msg.guild.roles.get(this.roleid);

        // adding the role
        if(action.toLowerCase() === "add") {
            if(msg.member.roles.has(this.roleid)) {
                msg.reply(`you already have the \`${roleName}\` role.`);
            } else {
                msg.member.addRole(this.roleid)
                    .catch(console.error);
                msg.reply(`the \`${roleName}\` role has been added to you`);
            }
        // removing the role
        } else if(action.toLowerCase() === "remove") {
            if(msg.member.roles.has(this.roleid)) {
                msg.member.removeRole(this.roleid)
                    .catch(console.error);
                msg.reply(`the \`${roleName}\` role has been removed from you`);
            } else {
                msg.reply(`you don't have the \`${roleName}\` role.`);
            }
        // invalid action
        } else {
            msg.reply(`invalid option: \`${action}\``);
        }
    }

};

module.exports = SelfRoleCommand;
