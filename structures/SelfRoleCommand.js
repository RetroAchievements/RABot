const Command = require('./Command.js');

class SelfRoleCommand extends Command {
    constructor(client, info, roleid) {
        super(client, info);
        
        this.roleid = roleid;
        this.throttling = info.throttling || { usages: 4, duration: 3600 };
    }

    async run(msg, { action } ) {
        let roleName = msg.guild.roles.get(this.roleid);

        if(action.toLower() === "add") {
            if(msg.member.roles.has(this.roleid)) {
                msg.reply(`you already have the \`${roleName}\` role.`);
            } else {
                msg.member.addRole(this.roleid)
                    .then(msg.reply(`the \`${roleName}\` role has been added to you`)
                    .catch(msg.reply);
            }
        } else if(action.toLower() === "remove") {
            if(msg.member.roles.has(this.roleid)) {
                msg.member.removeRole(this.roleid)
                    .then(msg.reply(`the \`${roleName}\` role has been removed from you`)
                    .catch(msg.reply);
            } else {
                msg.reply(`you don't have the \`${roleName}\` role.`);
        } else {
            msg.reply(`invalid option: \`${action}\``);
        }
    }

};

module.exports = SelfRoleCommand;
