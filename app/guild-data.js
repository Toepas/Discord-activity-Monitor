const DateDiff = require("date-diff");
const DiscordUtil = require("discordjs-util");

module.exports = class GuildData {
	/**
	 * Constructs an instance of GuildData
	 * @param {string} id ID of the guild
	 * @param {int} inactiveThresholdDays Number of days users should be marked inactive after
	 * @param {string} activeRoleID ID of the role to use to remove from inactive users
	 * @param {object} [users = {}] Object containing user IDs as keys and DateTime as values
	 * @param {bool} [allowRoleAddition = false] Should the bot be allowed to *add* as well as remove the role?
	 * @param {string[]} [ignoredUserIDs = new Array()] IDs to ignore when checking if users are active
	 */
	constructor(id, inactiveThresholdDays, activeRoleID, users, allowRoleAddition, ignoredUserIDs, ignoredRoleIDs) {
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
		const role = guild.roles.first(x => x.id === this.activeRoleID);
		if (!role)
			return;

		role.members.forEach(member => {
			if (!this.users[member.id]) //if the member has the role but isn't tracked, track them from now
				this.users[member.id] = new Date();
			else if (new DateDiff(now, Date.parse(this.users[member.id])).days() >= this.inactiveThresholdDays) { //else if their last active date was more days ago than the threshold remove their role
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