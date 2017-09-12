const DateDiff = require("date-diff");
const DiscordUtil = require("discordjs-util");

module.exports = class GuildData {
	constructor({ id, inactiveThresholdDays, activeRoleID, users, allowRoleAddition, ignoredUserIDs, ignoredRoleIDs }) {
		this.id = id;
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
			if (!this.users[member.id]) //if the member has the role but isn't tracked, track them from now
				this.users[member.id] = new Date();
			else if (!this.ignoredUserIDs.includes(member.id) //member isn't in the list of ignored member ids
				&& !member.roles.some(role => this.ignoredRoleIDs.includes(role.id)) //member doesn't have one of the ignored role ids
				&& new DateDiff(now, Date.parse(this.users[member.id])).days() >= this.inactiveThresholdDays) //their last active date was more days ago than the threshold remove their role
			{
				member.removeRole(this.activeRoleID).catch(e => DiscordUtil.dateError("Error removing active role from user " + member.name + " in guild " + guild.name, e));

				delete this.users[member.id]; //delete the user's last active time, as they have lost their role and thus don't matter anymore
			}
		});
	}

	fromJSON(data) {
		return Object.assign(this, data);
	}

	toString() {
		const blacklist = ["id", "users"];
		return JSON.stringify(this, (k, v) => !blacklist.includes(k) ? v : undefined, "\t");
	}
};