const Core = require("../../core");
const DateDiff = require("date-diff");
const DiscordUtil = require("../..//core").util;

module.exports = class GuildData extends Core.BaseGuildData {
    constructor() {
        super();

        //defined below in .schema but also here to shut up some errors later on about .indexOf not being available
        this.ignoredUserIDs = [String];
        this.ignoredRoleIDs = [String];

        this.schema({
            inactiveThresholdDays: { type: Number, default: 7, min: 1 },
            activeRoleID: String,
            inactiveRoleID: String,
            users: { type: Object, default: {} },
            allowRoleAddition: Boolean,
            ignoredUserIDs: [String],
            ignoredRoleIDs: [String]
        });
    }

    checkUsers(client) {
        const guild = client.guilds.get(this.guildID);
        if (!guild)
            return;

        const now = new Date();
        const role = guild.roles.find(x => x.id === this.activeRoleID);
        if (!role)
            return;

        role.members.forEach(member => {
            //don't ask me why, sometimes member is null, hence the if(member) check
            if (member && !this.users[member.id])
                this.users[member.id] = new Date();

            else if (this.shouldMarkInactive(member, now)) {
                this.doMarkInactive(member);

                delete this.users[member.id];
            }
        });
    }

    shouldMarkInactive(member, now) {
        // @ts-ignore because for whatever reason VSCode thinks .days() isn't available
        const isNowInactive = new DateDiff(now, Date.parse(this.users[member.id])).days() >= this.inactiveThresholdDays;

        return !this.memberIsIgnored(member) && isNowInactive;
    }

    doMarkInactive(member) {
        member.removeRole(this.activeRoleID)
            .catch(err => DiscordUtil.dateError("Error removing active role from user " + member.name + " in guild " + member.guild.name, err.message || err));

        if (this.inactiveRoleID && this.inactiveRoleID !== "disabled")
            member.addRole(this.inactiveRoleID);
    }

    shouldMarkActive(member) {
        const notAlreadyActive = !member.roles.get(this.activeRoleID);

        return !this.memberIsIgnored(member) && notAlreadyActive;
    }

    doMarkActive(member) {
        member.addRole(this.activeRoleID)
            .catch(err => DiscordUtil.dateError(`Error adding active role to user ${member.user.username} in guild ${member.guild.name}\n${err.message || err}`));

        if (this.inactiveRoleID && this.inactiveRoleID !== "disabled")
            member.removeRole(this.inactiveRoleID)
                .catch(err => DiscordUtil.dateError(`Error removing active role from user ${member.user.username} in guild ${member.guild.name}\n${err.message || err}`));
    }

    memberIsIgnored(member) {
        const isIgnoreduser = this.ignoredUserIDs.indexOf(member.id) > 0;
        const hasIgnoredRole = member.roles.some(role => this.ignoredRoleIDs.indexOf(role.id) >= 0);
        return isIgnoreduser || hasIgnoredRole;
    }

    toString() {
        const blacklist = ["id", "users"];
        return JSON.stringify(this, (k, v) => blacklist.indexOf(k) < 0 ? v : undefined, "\t");
    }
};