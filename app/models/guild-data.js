const Core = require("../../discord-bot-core");
const DateDiff = require("date-diff");
const DiscordUtil = require("../..//discord-bot-core").util;

module.exports = class GuildData extends Core.BaseGuildData {
	constructor({ id, inactiveThresholdDays, activeRoleID, users, allowRoleAddition, ignoredUserIDs, ignoredRoleIDs }) {
		super(id);
		this.inactiveThresholdDays = inactiveThresholdDays;
		this.activeRoleID = activeRoleID;
		this.users = users instanceof Object ? users : {};
		this.allowRoleAddition = allowRoleAddition ? true : false;
		this.ignoredUserIDs = Array.isArray(ignoredUserIDs) ? ignoredUserIDs : [];
		this.ignoredRoleIDs = Array.isArray(ignoredRoleIDs) ? ignoredRoleIDs : [];
	}

	checkUsers(client) {
		const guild = client.guilds.get(this.id);
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

			else if (this.ignoredUserIDs.indexOf(member.id) < 0 &&
				!member.roles.some(role => this.ignoredRoleIDs.indexOf(role.id) >= 0) &&
				// @ts-ignore
				new DateDiff(now, Date.parse(this.users[member.id])).days() >= this.inactiveThresholdDays) //this magic comment stops VSCode from auto formatting the below braces up here
			{
				member.removeRole(this.activeRoleID).catch(err => DiscordUtil.dateError("Error removing active role from user " + member.name + " in guild " + guild.name, err.message || err));

				delete this.users[member.id];
			}
		});
	}

	fromJSON(data) {
		return Object.assign(this, data);
	}

	toString() {
		const blacklist = ["id", "users"];
		return JSON.stringify(this, (k, v) => blacklist.indexOf(k) < 0 ? v : undefined, "\t");
	}
};